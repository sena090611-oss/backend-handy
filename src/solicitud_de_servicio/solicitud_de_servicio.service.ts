// Importamos decoradores y excepciones de NestJS para crear servicios e
// indicar errores HTTP.
import {
  Injectable, // Marca la clase como un proveedor que puede inyectarse.
  NotFoundException, // Lanza 404 cuando un recurso no existe.
  BadRequestException, // (no usado actualmente) para errores de petición.
} from '@nestjs/common';
// TypeORM nos permite inyectar repositorios de entidades para realizar
// operaciones de base de datos.
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// Entidades involucradas en este servicio.
import { SolicitudDeServicio } from './entities/solicitud-de-servicio.entity';
import { User } from '../user/entities/user.entity';
import { CreateSolicitudDeServicioDto } from './dto/create-solicitud-de-servicio.dto';
import { UpdateSolicitudDeServicioDto } from './dto/update-solicitud-de-servicio.dto';

/**
 * Servicio que contiene la lógica de negocio para la entidad
 * `SolicitudDeServicio`. Provee métodos CRUD y validaciones básicas.
 */
@Injectable()
export class SolicitudDeServicioService {
  constructor(
    @InjectRepository(SolicitudDeServicio)
    private readonly solicitudRepository: Repository<SolicitudDeServicio>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Crear una nueva solicitud de servicio asociada a un usuario.
   * Verifica que el `id_usuario` exista antes de persistir.
   */
  async create(dto: CreateSolicitudDeServicioDto): Promise<SolicitudDeServicio> {
    // Buscamos el usuario por su ID.
    const usuario = await this.userRepository.findOneBy({ id: dto.id_usuario });
    if (!usuario) {
      // Si no existe, lanzamos 404.
      throw new NotFoundException(`Usuario con id ${dto.id_usuario} no encontrado`);
    }
    // Creamos una instancia de SolicitudDeServicio con los datos recibidos.
    const solicitud = this.solicitudRepository.create({
      descripcion: dto.descripcion,
      usuario,
    });
    // Persistimos la entidad y devolvemos el registro creado.
    return await this.solicitudRepository.save(solicitud);
  }

  /** Obtener todas las solicitudes de servicio. */
  findAll(): Promise<SolicitudDeServicio[]> {
    return this.solicitudRepository.find();
  }

  /** Obtener una solicitud por su ID. Lanza 404 si no existe. */
  async findOne(id: number): Promise<SolicitudDeServicio> {
    const solicitud = await this.solicitudRepository.findOneBy({ id });
    if (!solicitud) {
      throw new NotFoundException(`Solicitud con id ${id} no encontrada`);
    }
    return solicitud;
  }

  /**
   * Listar todas las solicitudes asociadas a un usuario concreto.
   * Primero valida que el usuario exista.
   */
  async findByUser(userId: number): Promise<SolicitudDeServicio[]> {
    const usuario = await this.userRepository.findOneBy({ id: userId });
    if (!usuario) {
      throw new NotFoundException(`Usuario con id ${userId} no encontrado`);
    }
    return this.solicitudRepository.find({ where: { usuario: { id: userId } } });
  }

  /**
   * Actualiza una solicitud existente.
   * Permite cambiar la descripción y/o re‑asignar a otro usuario, siempre
   * validando la existencia del nuevo usuario.
   */
  async update(id: number, dto: UpdateSolicitudDeServicioDto): Promise<SolicitudDeServicio> {
    const solicitud = await this.findOne(id);
    // Si se envía un id_usuario distinto, validar y reasignar.
    if (dto.id_usuario && dto.id_usuario !== solicitud.usuario.id) {
      const nuevoUsuario = await this.userRepository.findOneBy({ id: dto.id_usuario });
      if (!nuevoUsuario) {
        throw new NotFoundException(`Usuario con id ${dto.id_usuario} no encontrado`);
      }
      solicitud.usuario = nuevoUsuario;
    }
    // Actualizamos la descripción si se proporciona.
    if (dto.descripcion) {
      solicitud.descripcion = dto.descripcion;
    }
    // Guardamos los cambios.
    return await this.solicitudRepository.save(solicitud);
  }

  /** Elimina una solicitud por su ID. */
  async remove(id: number): Promise<void> {
    const solicitud = await this.findOne(id);
    await this.solicitudRepository.remove(solicitud);
  }
}
