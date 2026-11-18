/**
 * Punto de entrada de la aplicación NestJS.
 * Aquí se crea la instancia de la API, se activan validaciones globales,
 * seguridad HTTP (helmet), rate limiting, CORS restringido y (solo fuera de
 * producción) Swagger. El servidor se levanta al final.
 */
import { NestFactory, Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { TypeOrmExceptionFilter } from './common/filters/typeorm-exception.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // Cabeceras de seguridad HTTP (hardening para producción).
  app.use(helmet());

  // Filtro global de errores de base de datos: traduce errores de TypeORM a
  // 409 Conflict (FK/duplicados) o 500 genérico sin exponer el SQL.
  app.useGlobalFilters(new TypeOrmExceptionFilter());

  // Configurar ValidationPipe globalmente
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina propiedades no definidas en el DTO
      forbidNonWhitelisted: true, // Lanza error si hay propiedades no permitidas
      transform: true, // Transforma los datos al tipo definido en el DTO
    }),
  );

  // Aplicar @Exclude() de class-transformer en todas las respuestas
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // CORS restringido: solo los orígenes definidos en CORS_ORIGINS (separados
  // por comas). Si la variable no viene (entorno de desarrollo), se permite
  // cualquier origen para no romper el trabajo local.
  const corsOrigins: string[] = (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((origin: string) => origin.trim())
    .filter((origin: string) => origin.length > 0);
  const isProduction = process.env.NODE_ENV === 'production';
  if (
    isProduction &&
    (corsOrigins.length === 0 || corsOrigins.includes('*'))
  ) {
    throw new Error(
      'CORS_ORIGINS debe contener orígenes explícitos y no puede usar "*" en producción',
    );
  }
  app.enableCors({
    origin: corsOrigins.length > 0 ? corsOrigins : true,
    credentials: true,
  });

  // Swagger solo fuera de producción: en producción no se expone la
  // documentación de la API al público.
  if (process.env.NODE_ENV !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Handy API')
      .setDescription('Documentación de la API de Handy')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, swaggerDocument, {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  const port: number = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
}
void bootstrap();
