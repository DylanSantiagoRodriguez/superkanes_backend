import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourcePersistenceModule } from '../../resources/resource-persistence.module';
import { PendienteVacunalEntity } from './entities/pendiente-vacunal.entity';
import { PendienteVacunalController } from './pendiente-vacunal.controller';
import { PendienteVacunalService } from './pendiente-vacunal.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PendienteVacunalEntity]),
    ResourcePersistenceModule,
  ],
  controllers: [PendienteVacunalController],
  providers: [PendienteVacunalService],
  exports: [PendienteVacunalService],
})
export class PendienteVacunalModule {}
