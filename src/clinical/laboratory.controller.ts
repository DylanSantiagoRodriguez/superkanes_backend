import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
  Req,
  UseFilters,
} from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import type { AuthenticatedRequest } from '../auth/auth.guard';
import { uuid } from '../resources/resource-validation';
import { DatabaseErrorFilter } from '../resources/database-error.filter';
import { LaboratoryService } from './laboratory.service';
class LaboratoryPageQuery {
  @IsOptional() @IsUUID() after?: string;
}
@ApiTags('laboratorio-clinico')
@ApiBearerAuth()
@ApiHeader({ name: 'X-Organization-Id', required: true })
@UseFilters(DatabaseErrorFilter)
@Controller('resources/clinica/laboratorio')
export class LaboratoryController {
  constructor(private readonly service: LaboratoryService) {}
  @Get('permisos')
  permissions(
    @Req() req: AuthenticatedRequest,
    @Headers('x-organization-id') org: string,
  ) {
    return this.service.permissions(req.identity, uuid(org));
  }
  @Get('atenciones/:id/ordenes')
  list(
    @Req() req: AuthenticatedRequest,
    @Headers('x-organization-id') org: string,
    @Param('id') id: string,
    @Query() query: LaboratoryPageQuery,
  ) {
    return this.service.list(req.identity, uuid(org), uuid(id), query.after);
  }
  @Post('ordenes')
  @ApiHeader({ name: 'Idempotency-Key', required: true })
  create(
    @Req() req: AuthenticatedRequest,
    @Headers('x-organization-id') org: string,
    @Body() body: unknown,
    @Headers('idempotency-key') key: string,
  ) {
    return this.service.create(req.identity, uuid(org), body, uuid(key));
  }
  @Post('ordenes/:id/avanzar')
  @ApiHeader({ name: 'Idempotency-Key', required: true })
  @ApiHeader({ name: 'If-Match', required: true })
  advance(
    @Req() req: AuthenticatedRequest,
    @Headers('x-organization-id') org: string,
    @Param('id') id: string,
    @Body() body: unknown,
    @Headers('idempotency-key') key: string,
    @Headers('if-match') version: string,
  ) {
    return this.service.advance(
      req.identity,
      uuid(org),
      uuid(id),
      body,
      uuid(key),
      version,
    );
  }
}
