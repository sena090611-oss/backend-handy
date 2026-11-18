import { ForbiddenException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ReporteIncidente } from './entities/reporte-incidente.entity';
import { ReporteIncidenteService } from './reporte-incidente.service';
import { SolicitudDeServicio } from '../solicitud_de_servicio/entities/solicitud-de-servicio.entity';
import { User, UserRole } from '../user/entities/user.entity';

describe('ReporteIncidenteService.create', () => {
  const reporteRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };
  const solicitudRepository = {
    findOne: jest.fn(),
  };
  const service = new ReporteIncidenteService(
    reporteRepository as unknown as Repository<ReporteIncidente>,
    solicitudRepository as unknown as Repository<SolicitudDeServicio>,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('no permite que un administrador reporte una solicitud ajena', async () => {
    solicitudRepository.findOne.mockResolvedValue({
      id: 8,
      usuario: { id: 1 },
      trabajador: { usuario: { id: 2 } },
    });

    await expect(
      service.create(
        { solicitudId: 8, descripcion: 'Reporte' },
        { id: 3, role: UserRole.ADMIN } as User,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(reporteRepository.create).not.toHaveBeenCalled();
  });
});
