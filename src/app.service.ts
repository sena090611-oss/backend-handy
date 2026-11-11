/**
 * Servicio base de la aplicación.
 * Actualmente entrega un mensaje de bienvenida del backend y sirve como
 * punto de prueba para la configuración inicial del proyecto.
 */
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
