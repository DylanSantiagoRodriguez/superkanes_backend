import { Controller, Get, Headers, Req, UseFilters } from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import type { AuthenticatedRequest } from '../auth/auth.guard';
import { ResourcePersistenceService } from './resource-persistence.service';
import { DatabaseErrorFilter } from './database-error.filter';
import { uuid } from './resource-validation';

@ApiTags('Resources')
@ApiBearerAuth()
@ApiHeader({ name: 'X-Organization-Id', required: true })
@UseFilters(DatabaseErrorFilter)
@Controller('resources')
export class ResourceCatalogController {
  constructor(private readonly persistence: ResourcePersistenceService) {}
  @Get()
  catalog(
    @Req() req: AuthenticatedRequest,
    @Headers('x-organization-id') org: string,
  ) {
    return this.persistence.catalog(
      req.identity,
      uuid(org, 'X-Organization-Id'),
    );
  }
}
