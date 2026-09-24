import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourcePersistenceModule } from '../../resources/resource-persistence.module';
import { AtencionClinicaEntity } from './entities/atencion-clinica.entity';
import { AtencionClinicaController } from './atencion-clinica.controller';
import { AtencionClinicaService } from './atencion-clinica.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AtencionClinicaEntity]),
    ResourcePersistenceModule,
  ],
  controllers: [AtencionClinicaController],
  providers: [AtencionClinicaService],
  exports: [AtencionClinicaService],
})
export class AtencionClinicaModule {}
