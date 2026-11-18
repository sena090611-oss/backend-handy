/**
 * Filtro global que captura los errores de base de datos (QueryFailedError de
 * TypeORM) y los traduce a respuestas HTTP claras:
 *
 * - 409 Conflict: violaciones de clave foránea (ER_ROW_IS_REFERENCED_2 cuando
 *   el registro está referenciado por otros datos, ER_NO_REFERENCED_ROW_2
 *   cuando se referencia a un registro inexistente) y duplicados
 *   (ER_DUP_ENTRY).
 * - 500 genérico: cualquier otro error de BD, sin exponer el SQL ni detalles
 *   internos del driver.
 *
 * El filtro solo intercepta QueryFailedError; las demás excepciones
 * (HttpException, errores de validación, etc.) siguen el comportamiento por
 * defecto de NestJS.
 */
import { ArgumentsHost, Catch, HttpStatus, Logger } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

/** Códigos de error de MySQL que se traducen a 409 Conflict. */
const CODIGOS_CONFLICTO: Record<string, string> = {
  // El registro que se intenta borrar/modificar está referenciado por otros.
  ER_ROW_IS_REFERENCED_2:
    'No se puede eliminar el registro porque otros datos dependen de él.',
  // Se intenta crear/actualizar con una referencia a un registro inexistente.
  ER_NO_REFERENCED_ROW_2:
    'El registro referenciado no existe, verifica los datos enviados.',
  // Se viola una restricción de unicidad (email, num_doc, etc.).
  ER_DUP_ENTRY: 'Ya existe un registro con esos datos (duplicado).',
};

@Catch(QueryFailedError)
export class TypeOrmExceptionFilter {
  private readonly logger = new Logger(TypeOrmExceptionFilter.name);

  catch(exception: QueryFailedError, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    // El código del driver (mysql2) llega en driverError.code. Si no está
    // disponible se recurre a errno, que coincide con el mismo catálogo.
    const driverError = (exception as QueryFailedError & {
      driverError?: { code?: string; errno?: number };
    }).driverError;
    const codigo: string =
      driverError?.code ?? String(driverError?.errno ?? '');

    const mensajeConflicto: string | undefined = CODIGOS_CONFLICTO[codigo];

    if (mensajeConflicto) {
      // 409 Conflict con mensaje claro para el cliente.
      response.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        message: mensajeConflicto,
      });
      return;
    }

    // 500 genérico: se registra el error completo en el log del servidor
    // (para diagnóstico) pero la respuesta NO incluye el SQL ni detalles
    // internos de la base de datos.
    this.logger.error(
      `Error de BD en ${request.method} ${request.url}: ${exception.message}`,
    );
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Error interno del servidor',
    });
  }
}
