import { Module } from '@nestjs/common';
import { ResourcePersistenceService } from './resource-persistence.service';
import { ResourceAccessService } from './resource-access.service';
import { ResourceRulesService } from './resource-rules.service';

@Module({
  providers: [
    ResourcePersistenceService,
    ResourceAccessService,
    ResourceRulesService,
  ],
  exports: [ResourcePersistenceService],
})
export class ResourcePersistenceModule {}
