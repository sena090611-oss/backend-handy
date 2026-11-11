/**
 * Punto de entrada de la aplicación NestJS.
 * Aquí se crea la instancia de la API, se activan validaciones globales,
 * se habilita Swagger y se levanta el servidor HTTP.
 */
import { NestFactory, Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

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

  // Habilitar CORS (opcional, para desarrollo con frontend)
  app.enableCors();

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

  const port: number = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
}
void bootstrap();