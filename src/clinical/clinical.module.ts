import { LaboratoryService } from './laboratory.service';
import { LaboratoryController } from './laboratory.controller';
import { Module } from '@nestjs/common';
import { ResourcePersistenceModule } from '../resources/resource-persistence.module';
import { ClinicalController } from './clinical.controller';
import { ClinicalService } from './clinical.service';
@Module({
  imports: [ResourcePersistenceModule],
  controllers: [ClinicalController, LaboratoryController],
  providers: [ClinicalService, LaboratoryService],
})
export class ClinicalModule {}
