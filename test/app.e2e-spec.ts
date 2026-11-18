import { INestApplication, Type, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { User, UserRole, UserStatus } from '../src/user/entities/user.entity';
import { Municipio } from '../src/municipio/entities/municipio.entity';
import { Zona } from '../src/zona/entities/zona.entity';
import { Portafolio } from '../src/portafolio/entities/portafolio.entity';
import {
  Trabajador,
  EstadoTrabajador,
} from '../src/trabajador/entities/trabajador.entity';
import { DetallePortafolio } from '../src/detalle_portafolio/detalle_portafolio/entities/detalle-portafolio.entity';
import { EstadoSolicitud } from '../src/solicitud_de_servicio/entities/solicitud-de-servicio.entity';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import request from 'supertest';

const requiredTestDatabaseVariables = [
  'TEST_DB_HOST',
  'TEST_DB_PORT',
  'TEST_DB_USERNAME',
  'TEST_DB_DATABASE',
] as const;
const testDatabaseConfigured = requiredTestDatabaseVariables.every(
  (key) => !!process.env[key],
);

let AppModule: Type<unknown> | undefined;
if (testDatabaseConfigured) {
  process.env.DB_HOST = process.env.TEST_DB_HOST;
  process.env.DB_PORT = process.env.TEST_DB_PORT;
  process.env.DB_USERNAME = process.env.TEST_DB_USERNAME;
  process.env.DB_PASSWORD = process.env.TEST_DB_PASSWORD ?? '';
  process.env.DB_DATABASE = process.env.TEST_DB_DATABASE;
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET =
    process.env.TEST_JWT_SECRET ?? 'only-for-automated-tests';
  AppModule = (
    require('../src/app.module') as { AppModule: Type<unknown> }
  ).AppModule;
}

const describeWithTestDatabase = testDatabaseConfigured
  ? describe
  : describe.skip;

describeWithTestDatabase('Handy API (e2e, requiere TEST_DB_*)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let testingModule: TestingModule;

  beforeAll(async () => {
    testingModule = await Test.createTestingModule({
      imports: [AppModule!],
    }).compile();
    app = testingModule.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    dataSource = testingModule.get(DataSource);
    await app.init();
  }, 120_000);

  afterAll(async () => {
    await app?.close();
  });

  it('responde 401 al consultar el perfil sin token', async () => {
    await request(app.getHttpServer()).get('/auth/profile').expect(401);
  });

  it('registra e inicia sesión, protege recursos y completa el flujo de servicio', async () => {
    const suffix = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const password = 'TestPassword123!';
    const municipioRepository = dataSource.getRepository(Municipio);
    const zonaRepository = dataSource.getRepository(Zona);
    const portafolioRepository = dataSource.getRepository(Portafolio);
    const usuarioRepository = dataSource.getRepository(User);
    const detalleRepository = dataSource.getRepository(DetallePortafolio);

    const municipio = await municipioRepository.save(
      municipioRepository.create({ nombre: `Test ${suffix}` }),
    );
    const zona = await zonaRepository.save(
      zonaRepository.create({ nombre: `Zona ${suffix}`, municipio }),
    );
    const portafolio = await portafolioRepository.save(
      portafolioRepository.create({
        nombreOficio: `Oficio${suffix}`.slice(0, 30),
        categoria: 'Pruebas',
        fechaHora: new Date().toISOString().slice(0, 10),
        descripcion: 'Oficio de prueba e2e',
      }),
    );
    const adminEmail = `admin.${suffix}@example.test`;
    await usuarioRepository.save(
      usuarioRepository.create({
        email: adminEmail,
        password: await bcrypt.hash(password, 4),
        fullName: 'Administrador e2e',
        role: UserRole.ADMIN,
        isActive: UserStatus.ACTIVO,
        municipio,
      }),
    );
    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: adminEmail, password })
      .expect(200);
    const adminToken = adminLogin.body.token as string;

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: `weak.${suffix}@example.test`,
        password: 'weakpassword',
        nombre: 'Registro débil',
        id_municipio: municipio.id,
        role: UserRole.CLIENTE,
      })
      .expect(400);

    const registrarYActivar = async (
      role: UserRole.CLIENTE | UserRole.TRABAJADOR,
      alias: string,
    ): Promise<{ id: number; token: string }> => {
      const email = `${alias}.${suffix}@example.test`;
      const registro = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email,
          password,
          nombre: `${alias} e2e`,
          id_municipio: municipio.id,
          role,
        })
        .expect(201);
      const id = registro.body.user.id as number;
      await request(app.getHttpServer())
        .patch(`/users/${id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: UserStatus.ACTIVO })
        .expect(200);
      const login = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password })
        .expect(200);
      return { id, token: login.body.token as string };
    };

    const cliente = await registrarYActivar(UserRole.CLIENTE, 'cliente');
    const trabajadorUsuario = await registrarYActivar(
      UserRole.TRABAJADOR,
      'trabajador',
    );
    const otroCliente = await registrarYActivar(UserRole.CLIENTE, 'otro');

    const perfilPropio = await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${cliente.token}`)
      .expect(200);
    expect(perfilPropio.body.id).toBe(cliente.id);
    await request(app.getHttpServer())
      .patch('/users/me')
      .set('Authorization', `Bearer ${cliente.token}`)
      .send({
        role: UserRole.ADMIN,
        isActive: UserStatus.ACTIVO,
        email: `cambio.${suffix}@example.test`,
      })
      .expect(400);
    await request(app.getHttpServer())
      .patch('/users/me')
      .set('Authorization', `Bearer ${cliente.token}`)
      .send({ nombre: 'Cliente actualizado' })
      .expect(200);
    await request(app.getHttpServer())
      .post('/auth/cambiar-password')
      .set('Authorization', `Bearer ${cliente.token}`)
      .send({
        currentPassword: 'Incorrecta123',
        newPassword: 'NuevaClave123',
      })
      .expect(401);
    await request(app.getHttpServer())
      .post('/auth/cambiar-password')
      .set('Authorization', `Bearer ${cliente.token}`)
      .send({ currentPassword: password, newPassword: 'NuevaClave123' })
      .expect(200);
    const nuevoLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: `cliente.${suffix}@example.test`, password: 'NuevaClave123' })
      .expect(200);
    cliente.token = nuevoLogin.body.token as string;

    const fichaResponse = await request(app.getHttpServer())
      .post('/trabajadores/me')
      .set('Authorization', `Bearer ${trabajadorUsuario.token}`)
      .send({
        zonaId: zona.id,
        municipioId: municipio.id,
        tipoDoc: 'CC',
        numDoc: `DOC${suffix}`,
        nombres: 'Trabajador',
        apellidos: 'Prueba',
        direccion: 'Dirección de prueba',
        telefono: '3001234567',
        nivelFormacion: 'TECNICO',
      })
      .expect(201);
    const trabajadorId = fichaResponse.body.id as number;
    expect(fichaResponse.body.estado).toBe(EstadoTrabajador.PENDIENTE);

    await request(app.getHttpServer())
      .patch(`/trabajadores/${trabajadorId}/estado`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ estado: EstadoTrabajador.ACTIVO })
      .expect(200);
    await detalleRepository.save(
      detalleRepository.create({
        trabajador: { id: trabajadorId } as Trabajador,
        portafolio,
        aniosExperiencia: 3,
        descripcionTrabajos: 'Trabajo de prueba',
      }),
    );

    const solicitudPayload = {
      descripcion: 'Solicito un servicio de prueba',
      direccionServicio: 'Calle de prueba 123',
      fechaServicio: new Date(Date.now() + 86_400_000).toISOString(),
      portafolioId: portafolio.id,
    };
    await request(app.getHttpServer())
      .post('/solicitudes')
      .set('Authorization', `Bearer ${cliente.token}`)
      .send({ ...solicitudPayload, id_usuario: otroCliente.id })
      .expect(400);

    const solicitudResponse = await request(app.getHttpServer())
      .post('/solicitudes')
      .set('Authorization', `Bearer ${cliente.token}`)
      .send(solicitudPayload)
      .expect(201);
    const solicitudId = solicitudResponse.body.id as number;

    const reporte = await request(app.getHttpServer())
      .post('/reporte-incidente')
      .set('Authorization', `Bearer ${cliente.token}`)
      .send({ solicitudId, descripcion: 'Reporte de prueba' })
      .expect(201);
    const reporteId = reporte.body.id as number;

    await request(app.getHttpServer())
      .get(`/solicitudes/${solicitudId}`)
      .set('Authorization', `Bearer ${otroCliente.token}`)
      .expect(403);
    await request(app.getHttpServer())
      .patch(`/solicitudes/${solicitudId}`)
      .set('Authorization', `Bearer ${otroCliente.token}`)
      .send({ descripcion: 'Edición no autorizada' })
      .expect(403);
    await request(app.getHttpServer())
      .delete(`/solicitudes/${solicitudId}`)
      .set('Authorization', `Bearer ${otroCliente.token}`)
      .expect(403);
    await request(app.getHttpServer())
      .get(`/reporte-incidente?solicitudId=${solicitudId}`)
      .set('Authorization', `Bearer ${otroCliente.token}`)
      .expect(403);
    await request(app.getHttpServer())
      .get(`/reporte-incidente/${reporteId}`)
      .set('Authorization', `Bearer ${otroCliente.token}`)
      .expect(403);
    await request(app.getHttpServer())
      .get(`/calificaciones/solicitud/${solicitudId}`)
      .set('Authorization', `Bearer ${otroCliente.token}`)
      .expect(403);
    await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${otroCliente.token}`)
      .expect(403);
    await request(app.getHttpServer())
      .get(`/users/${cliente.id}`)
      .set('Authorization', `Bearer ${otroCliente.token}`)
      .expect(403);

    await request(app.getHttpServer())
      .post(`/solicitudes/${solicitudId}/asignar`)
      .set('Authorization', `Bearer ${cliente.token}`)
      .send({ trabajadorId })
      .expect(200);
    const solicitudAsignada = await request(app.getHttpServer())
      .get(`/solicitudes/${solicitudId}`)
      .set('Authorization', `Bearer ${cliente.token}`)
      .expect(200);
    expect(solicitudAsignada.body.trabajador).not.toHaveProperty('numDoc');
    expect(solicitudAsignada.body.trabajador).not.toHaveProperty('direccion');
    expect(solicitudAsignada.body.trabajador.telefono).toBeNull();

    await request(app.getHttpServer())
      .patch(`/solicitudes/${solicitudId}/aceptar`)
      .set('Authorization', `Bearer ${trabajadorUsuario.token}`)
      .expect(200);
    await request(app.getHttpServer())
      .patch(`/solicitudes/${solicitudId}/iniciar`)
      .set('Authorization', `Bearer ${trabajadorUsuario.token}`)
      .expect(200);
    await request(app.getHttpServer())
      .patch(`/solicitudes/${solicitudId}/completar`)
      .set('Authorization', `Bearer ${trabajadorUsuario.token}`)
      .expect(200);

    const calificacion = await request(app.getHttpServer())
      .post('/calificaciones')
      .set('Authorization', `Bearer ${cliente.token}`)
      .send({ solicitudId, puntuacion: 5, comentario: 'Buen servicio' })
      .expect(201);
    expect(calificacion.body).not.toHaveProperty('solicitud');
    expect(calificacion.body.solicitudId).toBe(solicitudId);
    expect(calificacion.body).not.toHaveProperty('numDoc');
    expect(calificacion.body).not.toHaveProperty('direccion');
    expect(calificacion.body).not.toHaveProperty('email');

    const fichaAdmin = await request(app.getHttpServer())
      .get(`/trabajadores/${trabajadorId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(Number(fichaAdmin.body.promedioCalificacion)).toBe(5);
  }, 120_000);
});
