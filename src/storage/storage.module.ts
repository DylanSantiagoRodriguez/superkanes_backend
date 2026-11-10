import { ClinicalDocumentsController } from './clinical-documents.controller';
import { ClinicalDocumentsService } from './clinical-documents.service';
import { Module } from '@nestjs/common';
import { ResourceAccessModule } from '../resources/resource-access.module';
import { StorageCoreModule } from './storage-core.module';
import { StorageController } from './storage.controller';
@Module({
  imports: [ResourceAccessModule, StorageCoreModule],
  controllers: [StorageController, ClinicalDocumentsController],
  providers: [ClinicalDocumentsService],
})
export class StorageModule {}
