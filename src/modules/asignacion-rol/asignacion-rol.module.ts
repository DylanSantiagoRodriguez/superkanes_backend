import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourcePersistenceModule } from '../../resources/resource-persistence.module';
import { AsignacionRolEntity } from './entities/asignacion-rol.entity';
import { AsignacionRolController } from './asignacion-rol.controller';
import { AsignacionRolService } from './asignacion-rol.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AsignacionRolEntity]),
    ResourcePersistenceModule,
  ],
  controllers: [AsignacionRolController],
  providers: [AsignacionRolService],
  exports: [AsignacionRolService],
})
export class AsignacionRolModule {}
