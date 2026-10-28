import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Municipio } from '../municipio/entities/municipio.entity';
import { CreateZonaDto } from './dto/create-zona.dto';
import { UpdateZonaDto } from './dto/update-zona.dto';
import { Zona } from './entities/zona.entity';

@Injectable()
export class ZonaService {
  constructor(
    @InjectRepository(Zona)
    private readonly zonaRepository: Repository<Zona>,
    @InjectRepository(Municipio)
    private readonly municipioRepository: Repository<Municipio>,
  ) {}

  async create(dto: CreateZonaDto): Promise<Zona> {
    const municipio = await this.findMunicipio(dto.municipioId);
    const zona = this.zonaRepository.create({
      nombre: dto.nombre.trim(),
      municipio,
    });
    const zonaGuardada = await this.zonaRepository.save(zona);
    return this.findOne(zonaGuardada.id);
  }

  async findAll(): Promise<Zona[]> {
    return this.zonaRepository.find({
      relations: { municipio: true },
      order: { nombre: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Zona> {
    const zona = await this.zonaRepository.findOne({
      where: { id },
      relations: { municipio: true },
    });
    if (!zona) {
      throw new NotFoundException(`Zona con ID ${id} no encontrada`);
    }
    return zona;
  }

  async update(id: number, dto: UpdateZonaDto): Promise<Zona> {
    const zona = await this.findOne(id);

    if (dto.nombre !== undefined) {
      zona.nombre = dto.nombre.trim();
    }
    if (dto.municipioId !== undefined) {
      zona.municipio = await this.findMunicipio(dto.municipioId);
    }

    await this.zonaRepository.save(zona);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const zona = await this.findOne(id);
    await this.zonaRepository.remove(zona);
  }

  private async findMunicipio(id: number): Promise<Municipio> {
    const municipio = await this.municipioRepository.findOneBy({ id });
    if (!municipio) {
      throw new NotFoundException(`Municipio con ID ${id} no encontrado`);
    }
    return municipio;
  }
}
