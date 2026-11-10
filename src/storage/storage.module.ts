import { ClinicalDocumentsController } from './clinical-documents.controller';
import { ClinicalDocumentsService } from './clinical-documents.service';
import { Module } from '@nestjs/common';
import { ResourcePersistenceModule } from '../resources/resource-persistence.module';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';
@Module({
  imports: [ResourcePersistenceModule],
  controllers: [StorageController, ClinicalDocumentsController],
  providers: [StorageService, ClinicalDocumentsService],
})
export class StorageModule {}
