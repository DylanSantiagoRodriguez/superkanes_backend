import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { resourceEntities } from '../resources/resource-registry';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.getOrThrow<string>('DB_HOST'),
        port: config.getOrThrow<number>('POSTGRES_PORT'),
        database: config.getOrThrow<string>('POSTGRES_DB'),
        username: 'superkanes_app',
        password: config.getOrThrow<string>('POSTGRES_APP_PASSWORD'),
        schema: 'vet',
        autoLoadEntities: true,
        entities: resourceEntities,
        synchronize: false,
        migrationsRun: false,
        logging: false,
        retryAttempts: 3,
        retryDelay: 1000,
        extra: {
          max: config.getOrThrow<number>('DB_POOL_MAX'),
          connectionTimeoutMillis: 3000,
          statement_timeout: 5000,
          idleTimeoutMillis: 30000,
          application_name: 'superkanes-api',
        },
      }),
    }),
  ],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
