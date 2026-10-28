import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePortafolioDto } from './dto/create-portafolio.dto';
import { UpdatePortafolioDto } from './dto/update-portafolio.dto';
import { Portafolio } from './entities/portafolio.entity';

@Injectable()
export class PortafolioService {
  constructor(
    @InjectRepository(Portafolio)
    private readonly portafolioRepository: Repository<Portafolio>,
  ) {}

  async create(dto: CreatePortafolioDto): Promise<Portafolio> {
    const portafolio = this.portafolioRepository.create(dto);
    return this.portafolioRepository.save(portafolio);
  }

  async findAll(): Promise<Portafolio[]> {
    return this.portafolioRepository.find({ order: { fechaHora: 'DESC' } });
  }

  async findOne(id: number): Promise<Portafolio> {
    const portafolio = await this.portafolioRepository.findOneBy({ id });
    if (!portafolio) {
      throw new NotFoundException(`Portafolio con ID ${id} no encontrado`);
    }
    return portafolio;
  }

  async update(id: number, dto: UpdatePortafolioDto): Promise<Portafolio> {
    const portafolio = await this.findOne(id);
    this.portafolioRepository.merge(portafolio, dto);
    return this.portafolioRepository.save(portafolio);
  }

  async remove(id: number): Promise<void> {
    const portafolio = await this.findOne(id);
    await this.portafolioRepository.remove(portafolio);
  }
}