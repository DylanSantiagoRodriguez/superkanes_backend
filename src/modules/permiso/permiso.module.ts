import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourcePersistenceModule } from '../../resources/resource-persistence.module';
import { PermisoEntity } from './entities/permiso.entity';
import { PermisoController } from './permiso.controller';
import { PermisoService } from './permiso.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PermisoEntity]),
    ResourcePersistenceModule,
  ],
  controllers: [PermisoController],
  providers: [PermisoService],
  exports: [PermisoService],
})
export class PermisoModule {}
