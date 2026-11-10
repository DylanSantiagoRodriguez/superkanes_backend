import { Module } from '@nestjs/common';
import { ResourceAccessModule } from '../resources/resource-access.module';
import { StorageService } from './storage.service';
import { ClinicalDocumentArchiveService } from './clinical-document-archive.service';
@Module({
  imports: [ResourceAccessModule],
  providers: [StorageService, ClinicalDocumentArchiveService],
  exports: [StorageService, ClinicalDocumentArchiveService],
})
export class StorageCoreModule {}
