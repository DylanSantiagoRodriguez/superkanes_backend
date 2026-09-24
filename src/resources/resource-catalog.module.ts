import { Module } from '@nestjs/common';
import { ResourceCatalogController } from './resource-catalog.controller';
import { ResourcePersistenceModule } from './resource-persistence.module';

@Module({
  controllers: [ResourceCatalogController],
  imports: [ResourcePersistenceModule],
})
export class ResourceCatalogModule {}
