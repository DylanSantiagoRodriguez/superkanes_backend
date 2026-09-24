import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourcePersistenceModule } from '../../resources/resource-persistence.module';
import { RolPermisoEntity } from './entities/rol-permiso.entity';
import { RolPermisoController } from './rol-permiso.controller';
import { RolPermisoService } from './rol-permiso.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([RolPermisoEntity]),
    ResourcePersistenceModule,
  ],
  controllers: [RolPermisoController],
  providers: [RolPermisoService],
  exports: [RolPermisoService],
})
export class RolPermisoModule {}
