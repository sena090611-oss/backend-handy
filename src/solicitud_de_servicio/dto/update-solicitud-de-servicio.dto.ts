// DTO para actualizar una SolicitudDeServicio.
// Extiende de PartialType para que todas las propiedades del DTO de creación
// sean opcionales, permitiendo enviar solo los campos que se desean modificar.
import { PartialType } from '@nestjs/mapped-types';
import { CreateSolicitudDeServicioDto } from './create-solicitud-de-servicio.dto';

export class UpdateSolicitudDeServicioDto extends PartialType(CreateSolicitudDeServicioDto) {}