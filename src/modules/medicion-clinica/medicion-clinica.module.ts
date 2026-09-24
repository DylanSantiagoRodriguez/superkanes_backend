import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourcePersistenceModule } from '../../resources/resource-persistence.module';
import { MedicionClinicaEntity } from './entities/medicion-clinica.entity';
import { MedicionClinicaController } from './medicion-clinica.controller';
import { MedicionClinicaService } from './medicion-clinica.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([MedicionClinicaEntity]),
    ResourcePersistenceModule,
  ],
  controllers: [MedicionClinicaController],
  providers: [MedicionClinicaService],
  exports: [MedicionClinicaService],
})
export class MedicionClinicaModule {}
