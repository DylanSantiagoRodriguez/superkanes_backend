import { ClinicalModule } from './clinical/clinical.module';
import { StorageModule } from './storage/storage.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnvironment } from './config/environment';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { ResourceCatalogModule } from './resources/resource-catalog.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { DomainModule } from './modules/domain.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env'],
      validate: validateEnvironment,
    }),
    DatabaseModule,
    HealthModule,
    AuthModule,
    ResourceCatalogModule,
    DomainModule,
    ClinicalModule,
    StorageModule,
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 120 }]),
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
