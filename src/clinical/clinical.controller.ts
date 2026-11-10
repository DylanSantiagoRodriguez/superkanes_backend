import {
  Controller,
  Get,
  Headers,
  Param,
  Query,
  Req,
  UseFilters,
} from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import type { AuthenticatedRequest } from '../auth/auth.guard';
import { uuid } from '../resources/resource-validation';
import { DatabaseErrorFilter } from '../resources/database-error.filter';
import { ClinicalService } from './clinical.service';
import { ClinicalQueryDto } from './clinical-query.dto';

@ApiTags('clinica')
@ApiBearerAuth()
@ApiHeader({ name: 'X-Organization-Id', required: true })
@UseFilters(DatabaseErrorFilter)
@Controller('resources/clinica')
export class ClinicalController {
  constructor(private readonly service: ClinicalService) {}
  @Get('pacientes/:id')
  summary(
    @Req() req: AuthenticatedRequest,
    @Headers('x-organization-id') org: string,
    @Param('id') id: string,
  ) {
    return this.service.summary(req.identity, uuid(org), uuid(id));
  }
  @Get('pacientes/:id/registros/:section')
  records(
    @Req() req: AuthenticatedRequest,
    @Headers('x-organization-id') org: string,
    @Param('id') id: string,
    @Param('section') section: string,
    @Query() query: ClinicalQueryDto,
  ) {
    return this.service.list(req.identity, uuid(org), uuid(id), section, query);
  }
}
