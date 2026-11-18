import { ConflictException } from '@nestjs/common';
import { Repository } from 'typeorm';
import {
  Calificacion,
  CalificacionTipo,
} from './entities/calificacion.entity';
import { CalificacionService } from './calificacion.service';
import {
  EstadoSolicitud,
  SolicitudDeServicio,
} from '../solicitud_de_servicio/entities/solicitud-de-servicio.entity';
import { User, UserRole } from '../user/entities/user.entity';

describe('CalificacionService', () => {
  const calificacionRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };
  const solicitudRepository = {
    findOne: jest.fn(),
  };
  const service = new CalificacionService(
    calificacionRepository as unknown as Repository<Calificacion>,
    solicitudRepository as unknown as Repository<SolicitudDeServicio>,
  );
  const cliente = { id: 1, role: UserRole.CLIENTE } as User;
  const trabajador = {
    id: 2,
    usuario: { id: 2 },
  };
  const dto = { puntuacion: 5, solicitudId: 9 };

  const makeSolicitud = (
    estado: EstadoSolicitud,
    assignedWorker: typeof trabajador | null = trabajador,
    calificaciones: Calificacion[] = [],
  ): SolicitudDeServicio =>
    ({
      id: dto.solicitudId,
      estado,
      usuario: cliente,
      trabajador: assignedWorker,
      calificaciones,
    }) as SolicitudDeServicio;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('impide calificar si la solicitud no tiene trabajador asignado', async () => {
    solicitudRepository.findOne.mockResolvedValue(
      makeSolicitud(EstadoSolicitud.COMPLETADA, null),
    );

    await expect(service.createByCliente(dto, cliente)).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(calificacionRepository.save).not.toHaveBeenCalled();
  });

  it('impide calificar antes de completar la solicitud', async () => {
    solicitudRepository.findOne.mockResolvedValue(
      makeSolicitud(EstadoSolicitud.EN_CURSO),
    );

    await expect(service.createByCliente(dto, cliente)).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(calificacionRepository.save).not.toHaveBeenCalled();
  });

  it('impide crear dos calificaciones del mismo tipo', async () => {
    solicitudRepository.findOne.mockResolvedValue(
      makeSolicitud(EstadoSolicitud.COMPLETADA, trabajador, [
        { tipo: CalificacionTipo.CLIENTE_A_TRABAJADOR } as Calificacion,
      ]),
    );

    await expect(service.createByCliente(dto, cliente)).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(calificacionRepository.save).not.toHaveBeenCalled();
  });

  it('devuelve una proyección sin incluir la solicitud ni sus relaciones', async () => {
    const calificacion = {
      id: 12,
      puntuacion: 5,
      comentario: 'Buen servicio',
      tipo: CalificacionTipo.CLIENTE_A_TRABAJADOR,
      fecha: new Date('2026-01-01T00:00:00.000Z'),
      solicitud: {
        usuario: { email: 'cliente@example.test' },
        trabajador: { numDoc: '123456', direccion: 'Dirección privada' },
      },
    } as unknown as Calificacion;
    solicitudRepository.findOne.mockResolvedValue(
      makeSolicitud(EstadoSolicitud.COMPLETADA),
    );
    calificacionRepository.create.mockReturnValue(calificacion);
    calificacionRepository.save.mockResolvedValue(calificacion);
    calificacionRepository.findOne.mockResolvedValue(calificacion);

    await expect(service.createByCliente(dto, cliente)).resolves.toEqual({
      id: 12,
      solicitudId: dto.solicitudId,
      puntuacion: 5,
      comentario: 'Buen servicio',
      tipo: CalificacionTipo.CLIENTE_A_TRABAJADOR,
      fecha: calificacion.fecha,
    });
  });

  it('proyecta las calificaciones consultadas sin relaciones', async () => {
    const calificacion = {
      id: 13,
      puntuacion: 4,
      tipo: CalificacionTipo.CLIENTE_A_TRABAJADOR,
      fecha: new Date('2026-01-02T00:00:00.000Z'),
      solicitud: { usuario: { email: 'cliente@example.test' } },
    } as unknown as Calificacion;
    solicitudRepository.findOne.mockResolvedValue(
      makeSolicitud(EstadoSolicitud.COMPLETADA),
    );
    calificacionRepository.find.mockResolvedValue([calificacion]);

    await expect(service.findBySolicitud(dto.solicitudId, cliente)).resolves.toEqual([
      {
        id: 13,
        solicitudId: dto.solicitudId,
        puntuacion: 4,
        comentario: null,
        tipo: CalificacionTipo.CLIENTE_A_TRABAJADOR,
        fecha: calificacion.fecha,
      },
    ]);
  });
});
