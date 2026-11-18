// Importamos decoradores y excepciones de NestJS para crear servicios e
// indicar errores HTTP.
import {
  Injectable, // Marca la clase como un proveedor que puede inyectarse.
  BadRequestException, // Lanza 400 ante datos inválidos.
  NotFoundException, // Lanza 404 cuando un recurso no existe.
  ForbiddenException, // Lanza 403 cuando el usuario no tiene permisos.
  ConflictException, // Lanza 409 ante transiciones de estado inválidas.
} from '@nestjs/common';
// TypeORM nos permite inyectar repositorios de entidades para realizar
// operaciones de base de datos.
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// Entidades involucradas en este servicio.
import {
  EstadoSolicitud,
  SolicitudDeServicio,
} from './entities/solicitud-de-servicio.entity';
import { User, UserRole } from '../user/entities/user.entity';
import { Portafolio } from '../portafolio/entities/portafolio.entity';
import { Trabajador, EstadoTrabajador } from '../trabajador/entities/trabajador.entity';
import { DetallePortafolio } from '../detalle_portafolio/detalle_portafolio/entities/detalle-portafolio.entity';
import { CreateSolicitudDeServicioDto } from './dto/create-solicitud-de-servicio.dto';
import { UpdateSolicitudDeServicioDto } from './dto/update-solicitud-de-servicio.dto';
import { SolicitudResponseDto } from './dto/solicitud-response.dto';
import { SolicitudResponseMapper } from './solicitud-response.mapper';

// Relaciones que necesitan las consultas de solicitudes para armar la
// respuesta: dueño, oficio solicitado y ficha del trabajador (con su
// usuario, municipio y zona).
const RELACIONES_SOLICITUD = {
  usuario: { municipio: true },
  portafolio: true,
  trabajador: { usuario: true, municipio: true, zona: true },
} as const;

type AccionSolicitud =
  | 'asignar'
  | 'aceptar'
  | 'rechazar'
  | 'iniciar'
  | 'completar'
  | 'cancelar';

const TRANSICIONES_PERMITIDAS: Record<
  AccionSolicitud,
  { desde: EstadoSolicitud[]; hacia: EstadoSolicitud }
> = {
  asignar: {
    desde: [EstadoSolicitud.PENDIENTE],
    hacia: EstadoSolicitud.PENDIENTE,
  },
  aceptar: {
    desde: [EstadoSolicitud.PENDIENTE],
    hacia: EstadoSolicitud.ACEPTADA,
  },
  rechazar: {
    desde: [EstadoSolicitud.PENDIENTE],
    hacia: EstadoSolicitud.RECHAZADA,
  },
  iniciar: {
    desde: [EstadoSolicitud.ACEPTADA],
    hacia: EstadoSolicitud.EN_CURSO,
  },
  completar: {
    desde: [EstadoSolicitud.EN_CURSO],
    hacia: EstadoSolicitud.COMPLETADA,
  },
  cancelar: {
    desde: [EstadoSolicitud.PENDIENTE, EstadoSolicitud.ACEPTADA],
    hacia: EstadoSolicitud.CANCELADA,
  },
};

const ESTADOS_NO_EDITABLES = new Set([
  EstadoSolicitud.COMPLETADA,
  EstadoSolicitud.CANCELADA,
  EstadoSolicitud.RECHAZADA,
]);

/**
 * Servicio que contiene la lógica de negocio para la entidad
 * `SolicitudDeServicio`. Provee métodos CRUD y validaciones de permisos.
 */
@Injectable()
export class SolicitudDeServicioService {
  constructor(
    @InjectRepository(SolicitudDeServicio)
    private readonly solicitudRepository: Repository<SolicitudDeServicio>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Portafolio)
    private readonly portafolioRepository: Repository<Portafolio>,
    @InjectRepository(Trabajador)
    private readonly trabajadorRepository: Repository<Trabajador>,
    @InjectRepository(DetallePortafolio)
    private readonly detallePortafolioRepository: Repository<DetallePortafolio>,
    // Mapper que convierte las entidades en DTOs de respuesta seguros.
    private readonly responseMapper: SolicitudResponseMapper,
  ) {}

  /**
   * Valida que la fecha del servicio no esté en el pasado.
   * La fecha debe ser igual o posterior al momento de validación.
   */
  private validarFechaNoPasada(fechaServicio: string | Date): void {
    const fecha = new Date(fechaServicio);
    const ahora = Date.now();
    if (fecha.getTime() < ahora) {
      throw new BadRequestException(
        'La fecha del servicio no puede ser en el pasado',
      );
    }
  }

  /** Busca el portafolio (oficio) por ID; 404 si no existe. */
  private async buscarPortafolio(id: number): Promise<Portafolio> {
    const portafolio = await this.portafolioRepository.findOneBy({ id });
    if (!portafolio) {
      throw new NotFoundException(`Portafolio con id ${id} no encontrado`);
    }
    return portafolio;
  }

  /**
   * Crear una nueva solicitud de servicio a nombre del usuario autenticado.
   * El dueño se toma siempre del token, nunca del cuerpo de la petición.
   * Al crear se exigen direccionServicio, fechaServicio (no en el pasado)
   * y portafolioId.
   */
  async create(
    dto: CreateSolicitudDeServicioDto,
    usuario: User,
  ): Promise<SolicitudResponseDto> {
    // Validaciones de negocio que van más allá del formato del DTO.
    this.validarFechaNoPasada(dto.fechaServicio);
    const portafolio = await this.buscarPortafolio(dto.portafolioId);

    // Creamos una instancia de SolicitudDeServicio asignando como dueño al
    // usuario autenticado. El estado inicial es PENDIENTE (default de la
    // entidad) y la relación con el trabajador empieza en null.
    const solicitud = this.solicitudRepository.create({
      descripcion: dto.descripcion,
      direccionServicio: dto.direccionServicio,
      fechaServicio: new Date(dto.fechaServicio),
      portafolio,
      usuario,
    });
    // Persistimos la entidad y devolvemos el DTO de respuesta seguro.
    const guardada = await this.solicitudRepository.save(solicitud);
    return await this.responseMapper.toResponse(guardada, usuario);
  }

  /**
   * Obtener todas las solicitudes de servicio.
   * El controlador restringe esta operación a administradores con @Roles().
   */
  async findAll(usuario: User): Promise<SolicitudResponseDto[]> {
    const solicitudes = await this.solicitudRepository.find({
      relations: RELACIONES_SOLICITUD,
    });
    return await this.responseMapper.toResponseList(solicitudes, usuario);
  }

  /**
   * Busca una solicitud por su ID cargando las relaciones necesarias para
   * validar los permisos. Lanza 404 si no existe.
   */
  private async buscarSolicitud(id: number): Promise<SolicitudDeServicio> {
    const solicitud = await this.solicitudRepository.findOne({
      where: { id },
      relations: RELACIONES_SOLICITUD,
    });
    if (!solicitud) {
      throw new NotFoundException(`Solicitud con id ${id} no encontrada`);
    }
    return solicitud;
  }

  /**
   * Obtener una solicitud por su ID.
   * - admin: puede ver cualquier solicitud.
   * - cliente: solo sus propias solicitudes.
   * - trabajador: solo las solicitudes que tiene asignadas.
   */
  async findOne(id: number, usuario: User): Promise<SolicitudResponseDto> {
    const solicitud = await this.buscarSolicitud(id);
    // Validamos el acceso según el rol del usuario autenticado.
    this.verificarAccesoLectura(solicitud, usuario);
    // Devolvemos el DTO de respuesta seguro.
    return await this.responseMapper.toResponse(solicitud, usuario);
  }

  /**
   * Listar las solicitudes del usuario autenticado.
   * - cliente: sus propias solicitudes.
   * - trabajador: las solicitudes que tiene asignadas.
   * - admin: todas las solicitudes (puede gestionar todas).
   */
  async findMias(usuario: User): Promise<SolicitudResponseDto[]> {
    // El administrador puede ver todas las solicitudes.
    if (usuario.role === UserRole.ADMIN) {
      return await this.findAll(usuario);
    }
    // El trabajador solo ve las solicitudes que tiene asignadas.
    if (usuario.role === UserRole.TRABAJADOR) {
      const asignadas = await this.solicitudRepository.find({
        where: { trabajador: { usuario: { id: usuario.id } } },
        relations: RELACIONES_SOLICITUD,
      });
      return await this.responseMapper.toResponseList(asignadas, usuario);
    }
    // Por defecto (cliente) devolvemos sus propias solicitudes.
    const propias = await this.solicitudRepository.find({
      where: { usuario: { id: usuario.id } },
      relations: RELACIONES_SOLICITUD,
    });
    return await this.responseMapper.toResponseList(propias, usuario);
  }

  /**
   * Listar todas las solicitudes asociadas a un usuario concreto.
   * Ruta reservada a administradores.
   */
  async findByUser(
    userId: number,
    usuario: User,
  ): Promise<SolicitudResponseDto[]> {
    // Solo un administrador puede consultar las solicitudes de otro usuario.
    if (usuario.role !== UserRole.ADMIN && usuario.id !== userId) {
      throw new ForbiddenException(
        'No tienes permisos para ver las solicitudes de otro usuario',
      );
    }
    const usuarioConsultado = await this.userRepository.findOneBy({
      id: userId,
    });
    if (!usuarioConsultado) {
      throw new NotFoundException(`Usuario con id ${userId} no encontrado`);
    }
    const solicitudes = await this.solicitudRepository.find({
      where: { usuario: { id: userId } },
      relations: RELACIONES_SOLICITUD,
    });
    return await this.responseMapper.toResponseList(solicitudes, usuario);
  }

  /** Asigna o reasigna un trabajador a una solicitud pendiente. */
  async asignar(
    id: number,
    trabajadorId: number,
    usuario: User,
  ): Promise<SolicitudResponseDto> {
    const solicitud = await this.buscarSolicitud(id);
    this.verificarPropietario(solicitud, usuario);
    this.validarEstadoParaAccion(solicitud, 'asignar');

    const trabajador = await this.trabajadorRepository.findOne({
      where: { id: trabajadorId },
      relations: { municipio: true },
    });
    if (!trabajador) {
      throw new NotFoundException(
        `Trabajador con id ${trabajadorId} no encontrado`,
      );
    }
    if (trabajador.estado !== EstadoTrabajador.ACTIVO) {
      throw new BadRequestException(
        'Solo se pueden asignar trabajadores activos',
      );
    }
    if (!solicitud.portafolio) {
      throw new ConflictException(
        'La solicitud no tiene un oficio asociado para validar',
      );
    }

    const ofreceOficio = await this.detallePortafolioRepository.findOneBy({
      trabajador: { id: trabajador.id },
      portafolio: { id: solicitud.portafolio.id },
    });
    if (!ofreceOficio) {
      throw new BadRequestException(
        'El trabajador no ofrece el oficio solicitado',
      );
    }

    const municipioClienteId = solicitud.usuario.municipio?.id;
    if (!municipioClienteId) {
      throw new BadRequestException(
        'El cliente debe tener un municipio registrado para asignar el trabajador',
      );
    }
    if (trabajador.municipio.id !== municipioClienteId) {
      throw new BadRequestException(
        'El trabajador debe pertenecer al mismo municipio del cliente',
      );
    }

    solicitud.trabajador = trabajador;
    const guardada = await this.solicitudRepository.save(solicitud);
    return this.responseMapper.toResponse(guardada, usuario);
  }

  async aceptar(id: number, usuario: User): Promise<SolicitudResponseDto> {
    return this.transicionar(id, 'aceptar', usuario);
  }

  async rechazar(id: number, usuario: User): Promise<SolicitudResponseDto> {
    return this.transicionar(id, 'rechazar', usuario);
  }

  async iniciar(id: number, usuario: User): Promise<SolicitudResponseDto> {
    return this.transicionar(id, 'iniciar', usuario);
  }

  async completar(id: number, usuario: User): Promise<SolicitudResponseDto> {
    return this.transicionar(id, 'completar', usuario);
  }

  async cancelar(id: number, usuario: User): Promise<SolicitudResponseDto> {
    return this.transicionar(id, 'cancelar', usuario);
  }

  private async transicionar(
    id: number,
    accion: Exclude<AccionSolicitud, 'asignar'>,
    usuario: User,
  ): Promise<SolicitudResponseDto> {
    const solicitud = await this.buscarSolicitud(id);
    if (accion === 'cancelar') {
      this.verificarPropietario(solicitud, usuario);
    } else {
      this.verificarTrabajadorAsignado(solicitud, usuario);
    }
    this.validarEstadoParaAccion(solicitud, accion);
    solicitud.estado = TRANSICIONES_PERMITIDAS[accion].hacia;
    const guardada = await this.solicitudRepository.save(solicitud);
    return this.responseMapper.toResponse(guardada, usuario);
  }

  private validarEstadoParaAccion(
    solicitud: SolicitudDeServicio,
    accion: AccionSolicitud,
  ): void {
    const { desde } = TRANSICIONES_PERMITIDAS[accion];
    if (!desde.includes(solicitud.estado)) {
      throw new ConflictException(
        `No se puede ${accion} la solicitud desde el estado actual ${solicitud.estado}`,
      );
    }
  }

  private verificarTrabajadorAsignado(
    solicitud: SolicitudDeServicio,
    usuario: User,
  ): void {
    if (
      usuario.role !== UserRole.TRABAJADOR ||
      solicitud.trabajador?.usuario?.id !== usuario.id
    ) {
      throw new ForbiddenException(
        'Solo el trabajador asignado a la solicitud puede realizar esta acción',
      );
    }
  }

  /**
   * Actualizar una solicitud existente.
   * Solo el dueño de la solicitud (cliente) o un administrador pueden
   * modificarla. El dueño no puede cambiarse. Se pueden actualizar la
   * descripción, la dirección, la fecha del servicio (no en el pasado) y el
   * portafolio (oficio) solicitado.
   */
  async update(
    id: number,
    dto: UpdateSolicitudDeServicioDto,
    usuario: User,
  ): Promise<SolicitudResponseDto> {
    const solicitud = await this.buscarSolicitud(id);
    // Validamos que el usuario sea el dueño o un administrador.
    this.verificarPropietario(solicitud, usuario);
    this.verificarEditable(solicitud);
    // Actualizamos la descripción si se proporciona.
    if (dto.descripcion) {
      solicitud.descripcion = dto.descripcion;
    }
    // Actualizamos la dirección del servicio si se proporciona.
    if (dto.direccionServicio) {
      solicitud.direccionServicio = dto.direccionServicio;
    }
    // Actualizamos la fecha del servicio validando que no esté en el pasado.
    if (dto.fechaServicio) {
      this.validarFechaNoPasada(dto.fechaServicio);
      solicitud.fechaServicio = new Date(dto.fechaServicio);
    }
    // Actualizamos el oficio solicitado si se proporciona.
    if (dto.portafolioId) {
      solicitud.portafolio = await this.buscarPortafolio(dto.portafolioId);
    }
    // Guardamos los cambios y devolvemos el DTO de respuesta seguro.
    const guardada = await this.solicitudRepository.save(solicitud);
    return await this.responseMapper.toResponse(guardada, usuario);
  }

  /**
   * Eliminar una solicitud existente.
   * Solo el dueño de la solicitud (cliente) o un administrador pueden
   * eliminarla.
   */
  async remove(id: number, usuario: User): Promise<void> {
    const solicitud = await this.buscarSolicitud(id);
    // Validamos que el usuario sea el dueño o un administrador.
    this.verificarPropietario(solicitud, usuario);
    await this.solicitudRepository.remove(solicitud);
  }

  private verificarEditable(solicitud: SolicitudDeServicio): void {
    if (ESTADOS_NO_EDITABLES.has(solicitud.estado)) {
      throw new ConflictException(
        `No se puede editar la solicitud desde el estado actual ${solicitud.estado}`,
      );
    }
  }

  /**
   * Valida si el usuario puede consultar una solicitud según su rol.
   */
  private verificarAccesoLectura(
    solicitud: SolicitudDeServicio,
    usuario: User,
  ): void {
    // El administrador puede ver todas las solicitudes.
    if (usuario.role === UserRole.ADMIN) {
      return;
    }
    // El cliente solo puede ver sus propias solicitudes.
    if (
      usuario.role === UserRole.CLIENTE &&
      solicitud.usuario.id === usuario.id
    ) {
      return;
    }
    // El trabajador solo puede ver las solicitudes que tiene asignadas.
    if (
      usuario.role === UserRole.TRABAJADOR &&
      solicitud.trabajador?.usuario.id === usuario.id
    ) {
      return;
    }
    throw new ForbiddenException(
      'No tienes permisos para acceder a esta solicitud',
    );
  }

  /**
   * Valida que el usuario sea el dueño de la solicitud o un administrador.
   */
  private verificarPropietario(
    solicitud: SolicitudDeServicio,
    usuario: User,
  ): void {
    // El administrador puede gestionar todas las solicitudes.
    if (usuario.role === UserRole.ADMIN) {
      return;
    }
    // El resto de roles solo pueden gestionar sus propias solicitudes.
    if (solicitud.usuario.id === usuario.id) {
      return;
    }
    throw new ForbiddenException(
      'Solo el dueño de la solicitud o un administrador puede realizar esta acción',
    );
  }
}
