import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourcePersistenceModule } from '../../resources/resource-persistence.module';
import { RevisionClinicaEntity } from './entities/revision-clinica.entity';
import { RevisionClinicaController } from './revision-clinica.controller';
import { RevisionClinicaService } from './revision-clinica.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([RevisionClinicaEntity]),
    ResourcePersistenceModule,
  ],
  controllers: [RevisionClinicaController],
  providers: [RevisionClinicaService],
  exports: [RevisionClinicaService],
})
export class RevisionClinicaModule {}
