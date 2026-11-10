import { Module } from '@nestjs/common';
import { ResourcePersistenceModule } from '../resources/resource-persistence.module';
import { ClinicalController } from './clinical.controller';
import { ClinicalService } from './clinical.service';
@Module({
  imports: [ResourcePersistenceModule],
  controllers: [ClinicalController],
  providers: [ClinicalService],
})
export class ClinicalModule {}
