import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from '../src/health/health.controller';
import { DatabaseService } from '../src/database/database.service';
import { configureApp } from '../src/setup-app';

describe('Health HTTP endpoints', () => {
  let app: INestApplication<App>;
  const database = { checkReadiness: jest.fn() };

  beforeEach(async () => {
    database.checkReadiness.mockReset().mockResolvedValue(undefined);
    const moduleFixture = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
          load: [
            () => ({
              CORS_ORIGINS: ['http://localhost:5173'],
              SWAGGER_ENABLED: false,
            }),
          ],
        }),
      ],
      controllers: [HealthController],
      providers: [{ provide: DatabaseService, useValue: database }],
    })
      .overrideProvider(DatabaseService)
      .useValue(database)
      .compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
  });

  it('liveness no depende de PostgreSQL', () => {
    return request(app.getHttpServer())
      .get('/api/v1/health/live')
      .expect(200)
      .expect({ status: 'ok', service: 'superkanes-api' });
  });

  it('readiness comprueba la conexion', () => {
    return request(app.getHttpServer())
      .get('/api/v1/health/ready')
      .expect(200)
      .expect({ status: 'ok', database: 'up' });
  });

  it('fallo de BD devuelve 503 sin filtrar credenciales', () => {
    database.checkReadiness.mockRejectedValue(
      new Error('password=secret hostname=private'),
    );
    return request(app.getHttpServer())
      .get('/api/v1/health/ready')
      .expect(503)
      .expect({ status: 'error', database: 'unavailable' });
  });

  it('no expone aun endpoints clinicos', () => {
    return request(app.getHttpServer()).get('/api/v1/mascotas').expect(404);
  });

  afterEach(async () => {
    await app.close();
  });
});
