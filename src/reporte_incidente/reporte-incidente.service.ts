/**
 * Servicio de reportes de incidentes.
 * Gestiona la creación, validación, filtros y eliminación de reportes de servicio.
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere } from 'typeorm';
import { ReporteIncidente } from './entities/reporte-incidente.entity';
import { CreateReporteIncidenteDto } from './dto/create-reporte-incidente.dto';
import { UpdateReporteIncidenteDto } from './dto/update-reporte-incidente.dto';
import { FilterReporteIncidenteDto } from './dto/filter-reporte-incidente.dto';
import { SolicitudDeServicio } from '../solicitud_de_servicio/entities/solicitud-de-servicio.entity';

@Injectable()
export class ReporteIncidenteService {
  constructor(
    @InjectRepository(ReporteIncidente)
    private readonly reporteRepo: Repository<ReporteIncidente>,
    @InjectRepository(SolicitudDeServicio)
    private readonly solicitudRepo: Repository<SolicitudDeServicio>,
  ) {}

  async create(dto: CreateReporteIncidenteDto): Promise<ReporteIncidente> {
    const solicitud = await this.solicitudRepo.findOne({ where: { id: dto.solicitudId } });
    if (!solicitud) {
      throw new NotFoundException(`Solicitud con id ${dto.solicitudId} no encontrada`);
    }
    const reporte = this.reporteRepo.create({
      descripcion: dto.descripcion,
      estado: dto.estado,
      solicitud,
      reportadoPor: dto.reportadoPor,
    });
    return this.reporteRepo.save(reporte);
  }

  async findAll(filter?: FilterReporteIncidenteDto): Promise<ReporteIncidente[]> {
    const where: FindOptionsWhere<ReporteIncidente> = {} as any;
    if (filter?.solicitudId) where.solicitud = { id: filter.solicitudId } as any;
    if (filter?.estado) where.estado = filter.estado as any;
    if (filter?.fechaDesde && filter?.fechaHasta) {
      where.fechaCreacion = Between(new Date(filter.fechaDesde), new Date(filter.fechaHasta)) as any;
    } else if (filter?.fechaDesde) {
      where.fechaCreacion = Between(new Date(filter.fechaDesde), new Date()) as any;
    }
    return this.reporteRepo.find({ where, relations: { solicitud: true } });
  }

  async findOne(id: number): Promise<ReporteIncidente> {
    const reporte = await this.reporteRepo.findOne({ where: { id }, relations: { solicitud: true } });
    if (!reporte) throw new NotFoundException(`Reporte con id ${id} no encontrado`);
    return reporte;
  }

  async update(id: number, dto: UpdateReporteIncidenteDto): Promise<ReporteIncidente> {
    const reporte = await this.findOne(id);
    if (dto.solicitudId) {
      const solicitud = await this.solicitudRepo.findOne({ where: { id: dto.solicitudId } });
      if (!solicitud) throw new NotFoundException(`Solicitud con id ${dto.solicitudId} no encontrada`);
      reporte.solicitud = solicitud;
    }
    Object.assign(reporte, dto);
    return this.reporteRepo.save(reporte);
  }

  async remove(id: number): Promise<void> {
    const reporte = await this.findOne(id);
    await this.reporteRepo.remove(reporte);
  }
}
