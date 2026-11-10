import { Module } from '@nestjs/common';
import { ResourcePersistenceService } from './resource-persistence.service';
import { ResourceAccessModule } from './resource-access.module';
import { StorageCoreModule } from '../storage/storage-core.module';
import { ResourceRulesService } from './resource-rules.service';

@Module({
  imports: [ResourceAccessModule, StorageCoreModule],
  providers: [ResourcePersistenceService, ResourceRulesService],
  exports: [ResourcePersistenceService, ResourceAccessModule],
})
export class ResourcePersistenceModule {}
