import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Municipio } from '../municipio/entities/municipio.entity';
import { User, UserRole, UserStatus } from '../user/entities/user.entity';
import { Zona } from '../zona/entities/zona.entity';
import { CreateTrabajadorDto } from './dto/create-trabajador.dto';
import { UpdateEstadoTrabajadorDto } from './dto/update-estado-trabajador.dto';
import { UpdateTrabajadorDto } from './dto/update-trabajador.dto';
import { CreateTrabajadorPropioDto } from './dto/create-trabajador-propio.dto';
import { UpdateTrabajadorPropioDto } from './dto/update-trabajador-propio.dto';
import {
  EstadoTrabajador,
  Trabajador,
} from './entities/trabajador.entity';
import {
  Calificacion,
  CalificacionTipo,
} from '../calificacion/entities/calificacion.entity';
import { Disponibilidad } from '../disponibilidad/entities/disponibilidad.entity';
import { DetallePortafolio } from '../detalle_portafolio/detalle_portafolio/entities/detalle-portafolio.entity';
import { BuscarTrabajadoresDto } from './dto/buscar-trabajadores.dto';
import {
  TrabajadorBusquedaDto,
  TrabajadoresPaginadosDto,
} from './dto/trabajador-busqueda.dto';
import {
  TrabajadorPerfilPublicoDto,
} from './dto/trabajador-perfil-publico.dto';

@Injectable()
export class TrabajadorService {
  constructor(
    @InjectRepository(Trabajador)
    private readonly trabajadorRepository: Repository<Trabajador>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Zona)
    private readonly zonaRepository: Repository<Zona>,
    @InjectRepository(Municipio)
    private readonly municipioRepository: Repository<Municipio>,
    // Repositorio para acceder a las calificaciones y calcular promedios
    @InjectRepository(Calificacion)
    private readonly calificacionRepository: Repository<Calificacion>,
  ) {}

  async create(dto: CreateTrabajadorDto): Promise<Trabajador> {
    const usuario = await this.findTrabajadorUser(dto.usuarioId);
    return this.crearFicha(dto, usuario);
  }

  async createMine(
    dto: CreateTrabajadorPropioDto,
    usuario: User,
  ): Promise<Trabajador> {
    const usuarioVerificado = await this.findTrabajadorUser(usuario.id);
    return this.crearFicha(dto, usuarioVerificado);
  }

  private async crearFicha(
    dto: Omit<CreateTrabajadorDto, 'usuarioId'>,
    usuario: User,
  ): Promise<Trabajador> {
    const fichaExistente = await this.trabajadorRepository.findOneBy({
      usuario: { id: usuario.id },
    });
    if (fichaExistente) {
      throw new ConflictException(
        `El usuario con ID ${usuario.id} ya tiene una ficha de trabajador`,
      );
    }

    await this.ensureDocumentAvailable(dto.numDoc);

    const municipio = await this.findMunicipio(dto.municipioId);
    const zona = await this.findZoneInMunicipio(dto.zonaId, municipio.id);
    const trabajador = this.trabajadorRepository.create({
      usuario,
      municipio,
      zona,
      tipoDoc: dto.tipoDoc,
      numDoc: dto.numDoc.trim(),
      nombres: dto.nombres.trim(),
      apellidos: dto.apellidos.trim(),
      direccion: dto.direccion.trim(),
      telefono: dto.telefono.trim(),
      foto: dto.foto,
      nivelFormacion: dto.nivelFormacion,
      recomendaciones: dto.recomendaciones,
      estado: EstadoTrabajador.PENDIENTE,
    });

    return this.trabajadorRepository.save(trabajador);
  }

  async findAll(): Promise<Trabajador[]> {
    return this.trabajadorRepository.find({
      relations: { usuario: true, zona: true, municipio: true },
      order: { id: 'ASC' },
    });
  }

  // Obtiene un trabajador y agrega su promedio de calificación
  async findOne(id: number): Promise<Trabajador & { promedioCalificacion?: number }> {
    const trabajador = await this.trabajadorRepository.findOne({
      where: { id },
      relations: { usuario: true, zona: true, municipio: true },
    });
    if (!trabajador) {
      throw new NotFoundException(`Trabajador con ID ${id} no encontrado`);
    }
    // Consulta el promedio de puntuaciones de sus calificaciones
    const result = await this.calificacionRepository
      .createQueryBuilder('calif')
      .innerJoin('calif.solicitud', 'sol')
      .where('sol.id_trabajador = :trabajadorId', { trabajadorId: id })
      .andWhere('calif.tipo = :tipo', {
        tipo: CalificacionTipo.CLIENTE_A_TRABAJADOR,
      })
      .select('AVG(calif.puntuacion)', 'avg')
      .getRawOne();
    const promedio = Number(result?.avg) || 0; // si no hay calificaciones, 0
    // Devuelve el trabajador con la nueva propiedad promedioCalificacion
    return { ...trabajador, promedioCalificacion: promedio };
  }

  async findMine(usuario: User): Promise<Trabajador & { promedioCalificacion?: number }> {
    this.validarRolTrabajador(usuario);
    const ficha = await this.buscarFichaPorUsuario(usuario.id);
    return this.findOne(ficha.id);
  }

  async updateMine(
    dto: UpdateTrabajadorPropioDto,
    usuario: User,
  ): Promise<Trabajador> {
    this.validarRolTrabajador(usuario);
    const ficha = await this.buscarFichaPorUsuario(usuario.id);
    return this.actualizarFicha(await this.findOne(ficha.id), dto);
  }

  async buscar(
    filtros: BuscarTrabajadoresDto,
  ): Promise<TrabajadoresPaginadosDto> {
    const { query, promedioSql } = this.crearConsultaPublica();

    if (filtros.portafolioId !== undefined) {
      const oficioSubquery = query
        .subQuery()
        .select('1')
        .from(DetallePortafolio, 'detalleFiltro')
        .innerJoin('detalleFiltro.trabajador', 'trabajadorFiltro')
        .innerJoin('detalleFiltro.portafolio', 'portafolioFiltro')
        .where('trabajadorFiltro.id = trabajador.id')
        .andWhere('portafolioFiltro.id = :portafolioId')
        .getQuery();
      query.andWhere(`EXISTS ${oficioSubquery}`, {
        portafolioId: filtros.portafolioId,
      });
    }

    if (filtros.municipioId !== undefined) {
      query.andWhere('municipio.id = :municipioId', {
        municipioId: filtros.municipioId,
      });
    }
    if (filtros.zonaId !== undefined) {
      query.andWhere('zona.id = :zonaId', { zonaId: filtros.zonaId });
    }
    if (filtros.jornada !== undefined) {
      const jornadaSubquery = query
        .subQuery()
        .select('1')
        .from(Disponibilidad, 'disponibilidadFiltro')
        .innerJoin('disponibilidadFiltro.trabajador', 'trabajadorFiltroJornada')
        .where('trabajadorFiltroJornada.id = trabajador.id')
        .andWhere('disponibilidadFiltro.jornada = :jornada')
        .getQuery();
      query.andWhere(`EXISTS ${jornadaSubquery}`, {
        jornada: filtros.jornada,
      });
    }
    if (filtros.calificacionMinima !== undefined) {
      query.andWhere(`${promedioSql} >= :calificacionMinima`, {
        calificacionMinima: filtros.calificacionMinima,
      });
    }

    const page = filtros.page ?? 1;
    const limit = filtros.limit ?? 10;
    const total = await query.clone().getCount();
    const { entities, raw } = await query
      .orderBy('trabajador.nombres', 'ASC')
      .addOrderBy('trabajador.id', 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getRawAndEntities();
    const promedios = this.extraerPromedios(raw);

    return {
      data: entities.map((trabajador) =>
        this.toTrabajadorBusqueda(
          trabajador,
          promedios.get(trabajador.id) ?? 0,
        ),
      ),
      total,
      page,
      limit,
    };
  }

  async perfilPublico(id: number): Promise<TrabajadorPerfilPublicoDto> {
    const { query } = this.crearConsultaPublica();
    query.andWhere('trabajador.id = :trabajadorId', { trabajadorId: id });
    const { entities, raw } = await query.getRawAndEntities();
    const trabajador = entities[0];
    if (!trabajador) {
      throw new NotFoundException(
        `Trabajador activo con ID ${id} no encontrado`,
      );
    }

    const calificaciones = await this.calificacionRepository
      .createQueryBuilder('calificacion')
      .innerJoin('calificacion.solicitud', 'solicitud')
      .where('solicitud.id_trabajador = :trabajadorId', { trabajadorId: id })
      .andWhere('calificacion.tipo = :tipo', {
        tipo: CalificacionTipo.CLIENTE_A_TRABAJADOR,
      })
      .select([
        'calificacion.id',
        'calificacion.puntuacion',
        'calificacion.comentario',
        'calificacion.fecha',
      ])
      .orderBy('calificacion.fecha', 'DESC')
      .getMany();

    const promedio = this.extraerPromedios(raw).get(id) ?? 0;
    const perfil = new TrabajadorPerfilPublicoDto();
    Object.assign(perfil, this.toTrabajadorBusqueda(trabajador, promedio));
    perfil.resenas = calificaciones.map((calificacion) => ({
      puntuacion: calificacion.puntuacion,
      comentario: calificacion.comentario ?? null,
      fecha: calificacion.fecha,
    }));
    return perfil;
  }

  private crearConsultaPublica(): {
    query: SelectQueryBuilder<Trabajador>;
    promedioSql: string;
  } {
    const query = this.trabajadorRepository
      .createQueryBuilder('trabajador')
      .leftJoinAndSelect('trabajador.municipio', 'municipio')
      .leftJoinAndSelect('trabajador.zona', 'zona')
      .leftJoinAndSelect('trabajador.detallesPortafolio', 'detalle')
      .leftJoinAndSelect('detalle.portafolio', 'portafolio')
      .leftJoinAndSelect('trabajador.disponibilidades', 'disponibilidad')
      .where('trabajador.estado = :estadoActivo', {
        estadoActivo: EstadoTrabajador.ACTIVO,
      })
      .addSelect('trabajador.id', 'trabajador_publico_id');

    const promedioSql = query
      .subQuery()
      .select('COALESCE(AVG(calificacion.puntuacion), 0)')
      .from(Calificacion, 'calificacion')
      .innerJoin('calificacion.solicitud', 'solicitud')
      .where('solicitud.id_trabajador = trabajador.id')
      .andWhere('calificacion.tipo = :tipoPromedio')
      .getQuery();

    query
      .addSelect(promedioSql, 'promedio_calificacion')
      .setParameter('tipoPromedio', CalificacionTipo.CLIENTE_A_TRABAJADOR);

    return { query, promedioSql };
  }

  private extraerPromedios(
    filas: Array<{
      trabajador_publico_id: number | string;
      promedio_calificacion: number | string;
    }>,
  ): Map<number, number> {
    const promedios = new Map<number, number>();
    for (const fila of filas) {
      promedios.set(
        Number(fila.trabajador_publico_id),
        Number(fila.promedio_calificacion) || 0,
      );
    }
    return promedios;
  }

  private toTrabajadorBusqueda(
    trabajador: Trabajador,
    promedioCalificacion: number,
  ): TrabajadorBusquedaDto {
    const dto = new TrabajadorBusquedaDto();
    dto.id = trabajador.id;
    dto.nombres = trabajador.nombres;
    dto.apellidoInicial = `${trabajador.apellidos.charAt(0)}.`;
    dto.foto = trabajador.foto;
    dto.nivelFormacion = trabajador.nivelFormacion;
    dto.municipio = trabajador.municipio?.nombre ?? null;
    dto.zona = trabajador.zona?.nombre ?? null;
    dto.promedioCalificacion = promedioCalificacion;
    dto.oficios = (trabajador.detallesPortafolio ?? []).map((detalle) => ({
      id: detalle.id,
      nombreOficio: detalle.portafolio.nombreOficio,
      categoria: detalle.portafolio.categoria,
      descripcionTrabajos: detalle.descripcionTrabajos,
      aniosExperiencia: detalle.aniosExperiencia,
    }));
    dto.jornadas = [
      ...new Set(
        (trabajador.disponibilidades ?? []).map(
          (disponibilidad) => disponibilidad.jornada,
        ),
      ),
    ];
    return dto;
  }

  async update(id: number, dto: UpdateTrabajadorDto): Promise<Trabajador> {
    const trabajador = await this.findOne(id);
    return this.actualizarFicha(trabajador, dto);
  }

  private async actualizarFicha(
    trabajador: Trabajador,
    dto: UpdateTrabajadorDto,
  ): Promise<Trabajador> {
    if (dto.numDoc !== undefined && dto.numDoc !== trabajador.numDoc) {
      await this.ensureDocumentAvailable(dto.numDoc, trabajador.id);
      trabajador.numDoc = dto.numDoc.trim();
    }

    const municipioId = dto.municipioId ?? trabajador.municipio.id;
    const zonaId = dto.zonaId ?? trabajador.zona.id;
    trabajador.municipio = await this.findMunicipio(municipioId);
    trabajador.zona = await this.findZoneInMunicipio(zonaId, municipioId);

    if (dto.tipoDoc !== undefined) trabajador.tipoDoc = dto.tipoDoc;
    if (dto.nombres !== undefined) trabajador.nombres = dto.nombres.trim();
    if (dto.apellidos !== undefined) trabajador.apellidos = dto.apellidos.trim();
    if (dto.direccion !== undefined) trabajador.direccion = dto.direccion.trim();
    if (dto.telefono !== undefined) trabajador.telefono = dto.telefono.trim();
    if (dto.foto !== undefined) trabajador.foto = dto.foto;
    if (dto.nivelFormacion !== undefined) {
      trabajador.nivelFormacion = dto.nivelFormacion;
    }
    if (dto.recomendaciones !== undefined) {
      trabajador.recomendaciones = dto.recomendaciones;
    }

    await this.trabajadorRepository.save(trabajador);
    return this.findOne(trabajador.id);
  }

  async updateEstado(
    id: number,
    dto: UpdateEstadoTrabajadorDto,
  ): Promise<Trabajador> {
    await this.trabajadorRepository.manager.transaction(async (manager) => {
      const trabajadorRepository = manager.getRepository(Trabajador);
      const userRepository = manager.getRepository(User);
      const trabajador = await trabajadorRepository.findOne({
        where: { id },
        relations: { usuario: true },
      });
      if (!trabajador) {
        throw new NotFoundException(`Trabajador con ID ${id} no encontrado`);
      }

      trabajador.estado = dto.estado;
      if (dto.estado === EstadoTrabajador.ACTIVO) {
        trabajador.usuario.isActive = UserStatus.ACTIVO;
        await userRepository.save(trabajador.usuario);
      } else if (dto.estado === EstadoTrabajador.INACTIVO) {
        trabajador.usuario.isActive = UserStatus.SUSPENDIDO;
        await userRepository.save(trabajador.usuario);
      } else {
        trabajador.usuario.isActive = UserStatus.PENDIENTE;
        await userRepository.save(trabajador.usuario);
      }
      await trabajadorRepository.save(trabajador);
    });
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const trabajador = await this.findOne(id);
    await this.trabajadorRepository.remove(trabajador);
  }

  private async findTrabajadorUser(id: number): Promise<User> {
    const usuario = await this.userRepository.findOneBy({ id });
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    if (usuario.role !== UserRole.TRABAJADOR) {
      throw new BadRequestException(
        `El usuario con ID ${id} no tiene el rol trabajador`,
      );
    }
    return usuario;
  }

  private validarRolTrabajador(usuario: User): void {
    if (usuario.role !== UserRole.TRABAJADOR) {
      throw new ForbiddenException(
        'Esta operación solo está disponible para trabajadores',
      );
    }
  }

  private async buscarFichaPorUsuario(userId: number): Promise<Trabajador> {
    const ficha = await this.trabajadorRepository.findOneBy({
      usuario: { id: userId },
    });
    if (!ficha) {
      throw new NotFoundException(
        'No tienes una ficha de trabajador registrada',
      );
    }
    return ficha;
  }

  private async findMunicipio(id: number): Promise<Municipio> {
    const municipio = await this.municipioRepository.findOneBy({ id });
    if (!municipio) {
      throw new NotFoundException(`Municipio con ID ${id} no encontrado`);
    }
    return municipio;
  }

  private async findZoneInMunicipio(
    zonaId: number,
    municipioId: number,
  ): Promise<Zona> {
    const zona = await this.zonaRepository.findOne({
      where: { id: zonaId },
      relations: { municipio: true },
    });
    if (!zona) {
      throw new NotFoundException(`Zona con ID ${zonaId} no encontrada`);
    }
    if (zona.municipio.id !== municipioId) {
      throw new BadRequestException(
        `La zona con ID ${zonaId} no pertenece al municipio con ID ${municipioId}`,
      );
    }
    return zona;
  }

  private async ensureDocumentAvailable(
    numDoc: string,
    excludeId?: number,
  ): Promise<void> {
    const trabajador = await this.trabajadorRepository.findOneBy({
      numDoc: numDoc.trim(),
    });
    if (trabajador && trabajador.id !== excludeId) {
      throw new ConflictException(
        'El número de documento ya está registrado para otro trabajador',
      );
    }
  }
}
