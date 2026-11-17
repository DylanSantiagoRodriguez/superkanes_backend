import { CalendarService } from './calendar.service';
import { CalendarQueryDto } from './calendar-query.dto';
import { Body, Post, Patch } from '@nestjs/common';
import { ResourcePersistenceService } from '../resources/resource-persistence.service';
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
  constructor(
    private readonly service: ClinicalService,
    private readonly calendar: CalendarService,
    private readonly persistence: ResourcePersistenceService,
  ) {}
  @Get('pacientes/:id')
  summary(
    @Req() req: AuthenticatedRequest,
    @Headers('x-organization-id') org: string,
    @Param('id') id: string,
  ) {
    return this.service.summary(req.identity, uuid(org), uuid(id));
  }
  @Post('pacientes/:id/pesos')
  @ApiHeader({ name: 'Idempotency-Key', required: true })
  weight(
    @Req() req: AuthenticatedRequest,
    @Headers('x-organization-id') org: string,
    @Param('id') id: string,
    @Body() body: unknown,
    @Headers('idempotency-key') key: string,
  ) {
    return this.service.saveWeight(
      req.identity,
      uuid(org),
      uuid(id),
      body,
      uuid(key),
    );
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
  @Get('revisiones/:id')
  details(
    @Req() req: AuthenticatedRequest,
    @Headers('x-organization-id') org: string,
    @Param('id') id: string,
  ) {
    return this.service.details(req.identity, uuid(org), uuid(id));
  }
  @Post('revisiones/:id/guardar')
  @ApiHeader({ name: 'If-Match', required: true })
  @ApiHeader({ name: 'Idempotency-Key', required: true })
  save(
    @Req() req: AuthenticatedRequest,
    @Headers('x-organization-id') org: string,
    @Param('id') id: string,
    @Body() body: unknown,
    @Headers('idempotency-key') key: string,
    @Headers('if-match') version: string,
  ) {
    return this.persistence.saveClinical(
      req.identity,
      uuid(org),
      uuid(id),
      body,
      uuid(key),
      version,
    );
  }
  @Post('revisiones/:id/corregir')
  @ApiHeader({ name: 'If-Match', required: true })
  @ApiHeader({ name: 'Idempotency-Key', required: true })
  correct(
    @Req() req: AuthenticatedRequest,
    @Headers('x-organization-id') org: string,
    @Param('id') id: string,
    @Body() body: unknown,
    @Headers('idempotency-key') key: string,
    @Headers('if-match') version: string,
  ) {
    return this.persistence.correctClinical(
      req.identity,
      uuid(org),
      uuid(id),
      body,
      uuid(key),
      version,
    );
  }
  @Post('consentimientos/:id/responder')
  @ApiHeader({ name: 'If-Match', required: true })
  @ApiHeader({ name: 'Idempotency-Key', required: true })
  respond(
    @Req() req: AuthenticatedRequest,
    @Headers('x-organization-id') org: string,
    @Param('id') id: string,
    @Body() body: unknown,
    @Headers('idempotency-key') key: string,
    @Headers('if-match') version: string,
  ) {
    return this.persistence.respondClinicalConsent(
      req.identity,
      uuid(org),
      uuid(id),
      body,
      uuid(key),
      version,
    );
  }
  @Get('calendario')
  calendarEvents(
    @Req() req: AuthenticatedRequest,
    @Headers('x-organization-id') org: string,
    @Query() query: CalendarQueryDto,
  ) {
    return this.calendar.list(req.identity, uuid(org), query);
  }
  @Get('agenda')
  agenda(
    @Req() req: AuthenticatedRequest,
    @Headers('x-organization-id') org: string,
    @Query() query: ClinicalQueryDto,
  ) {
    return this.service.agenda(req.identity, uuid(org), query);
  }
  @Post('citas/:id/ingreso-peluqueria')
  @ApiHeader({ name: 'If-Match', required: true })
  @ApiHeader({ name: 'Idempotency-Key', required: true })
  groomingAdmission(
    @Req() req: AuthenticatedRequest,
    @Headers('x-organization-id') org: string,
    @Param('id') id: string,
    @Body() body: unknown,
    @Headers('idempotency-key') key: string,
    @Headers('if-match') version: string,
  ) {
    return this.persistence.groomingAdmission(
      req.identity,
      uuid(org),
      uuid(id),
      body,
      uuid(key),
      version,
    );
  }
  @Patch('citas/:id/llegada')
  @ApiHeader({ name: 'If-Match', required: true })
  arrival(
    @Req() req: AuthenticatedRequest,
    @Headers('x-organization-id') org: string,
    @Param('id') id: string,
    @Headers('if-match') version: string,
  ) {
    return this.persistence.appointmentArrival(
      req.identity,
      uuid(org),
      uuid(id),
      version,
    );
  }
}
