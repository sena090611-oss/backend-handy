import {
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { User, UserRole } from '../user/entities/user.entity';
import { Portafolio } from '../portafolio/entities/portafolio.entity';
import { Trabajador } from '../trabajador/entities/trabajador.entity';
import { DetallePortafolio } from '../detalle_portafolio/detalle_portafolio/entities/detalle-portafolio.entity';
import { SolicitudResponseDto } from './dto/solicitud-response.dto';
import { SolicitudResponseMapper } from './solicitud-response.mapper';
import {
  EstadoSolicitud,
  SolicitudDeServicio,
} from './entities/solicitud-de-servicio.entity';
import { SolicitudDeServicioService } from './solicitud_de_servicio.service';

describe('SolicitudDeServicioService', () => {
  const solicitudRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };
  const responseMapper = {
    toResponse: jest.fn().mockResolvedValue(new SolicitudResponseDto()),
    toResponseList: jest.fn().mockResolvedValue([]),
  };
  const service = new SolicitudDeServicioService(
    solicitudRepository as unknown as Repository<SolicitudDeServicio>,
    {} as Repository<User>,
    {} as Repository<Portafolio>,
    {} as Repository<Trabajador>,
    {} as Repository<DetallePortafolio>,
    responseMapper as unknown as SolicitudResponseMapper,
  );
  const owner = { id: 11, role: UserRole.CLIENTE } as User;
  const anotherClient = { id: 12, role: UserRole.CLIENTE } as User;
  const workerUser = { id: 13, role: UserRole.TRABAJADOR } as User;

  const makeSolicitud = (
    estado: EstadoSolicitud = EstadoSolicitud.PENDIENTE,
  ): SolicitudDeServicio =>
    ({
      id: 21,
      estado,
      usuario: owner,
      trabajador: { usuario: workerUser },
    }) as SolicitudDeServicio;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('impide que un cliente edite o elimine una solicitud ajena', async () => {
    solicitudRepository.findOne.mockResolvedValue(makeSolicitud());

    await expect(
      service.update(21, { descripcion: 'Descripción actualizada' }, anotherClient),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(service.remove(21, anotherClient)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(solicitudRepository.save).not.toHaveBeenCalled();
    expect(solicitudRepository.remove).not.toHaveBeenCalled();
  });

  it('permite completar la secuencia de estados válida', async () => {
    const solicitud = makeSolicitud();
    solicitudRepository.findOne.mockResolvedValue(solicitud);
    solicitudRepository.save.mockImplementation(
      async (guardada: SolicitudDeServicio) => guardada,
    );

    await service.aceptar(21, workerUser);
    expect(solicitud.estado).toBe(EstadoSolicitud.ACEPTADA);
    await service.iniciar(21, workerUser);
    expect(solicitud.estado).toBe(EstadoSolicitud.EN_CURSO);
    await service.completar(21, workerUser);
    expect(solicitud.estado).toBe(EstadoSolicitud.COMPLETADA);
    expect(solicitudRepository.save).toHaveBeenCalledTimes(3);
  });

  it('rechaza una transición inválida e informa el estado actual', async () => {
    solicitudRepository.findOne.mockResolvedValue(
      makeSolicitud(EstadoSolicitud.PENDIENTE),
    );

    await expect(service.iniciar(21, workerUser)).rejects.toMatchObject({
      status: 409,
      message: expect.stringContaining(EstadoSolicitud.PENDIENTE),
    });
    expect(solicitudRepository.save).not.toHaveBeenCalled();
  });
});
