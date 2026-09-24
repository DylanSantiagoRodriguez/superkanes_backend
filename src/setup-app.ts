import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

export function configureApp(app: INestApplication): void {
  const config = app.get(ConfigService);
  app.setGlobalPrefix('api/v1');
  app.use(helmet());
  app.enableCors({
    origin: config.getOrThrow<string[]>('CORS_ORIGINS'),
    exposedHeaders: ['ETag'],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  if (config.getOrThrow<boolean>('SWAGGER_ENABLED')) {
    const document = new DocumentBuilder()
      .setTitle('Superkanes API')
      .setDescription(
        'API protegida por OIDC, permisos por recurso y clinica. Las operaciones inmutables no admiten edicion o borrado.',
      )
      .addBearerAuth()
      .setVersion('0.1.0')
      .build();
    const specification = SwaggerModule.createDocument(app, document);
    SwaggerModule.setup('api/docs', app, specification);
  }
}
