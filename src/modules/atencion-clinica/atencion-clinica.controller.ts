import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Query,
  Param,
  Headers,
  Req,
  Res,
  HttpCode,
  UseFilters,
} from '@nestjs/common';
import {
  ApiTags,
  ApiExcludeEndpoint,
  ApiBearerAuth,
  ApiHeader,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiExtraModels,
  getSchemaPath,
} from '@nestjs/swagger';
import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../auth/auth.guard';
import { uuid } from '../../resources/resource-validation';
import { DatabaseErrorFilter } from '../../resources/database-error.filter';
import { ListQueryDto } from '../../common/dto/list-query.dto';
import { AtencionClinicaService } from './atencion-clinica.service';
import { AtencionClinicaResponseDto } from './dto/atencion-clinica-response.dto';
import { CreateAtencionClinicaDto } from './dto/create-atencion-clinica.dto';
import { UpdateAtencionClinicaDto } from './dto/update-atencion-clinica.dto';

@ApiTags('atencion_clinica')
@ApiBearerAuth()
@ApiHeader({ name: 'X-Organization-Id', required: true })
@ApiExtraModels(AtencionClinicaResponseDto)
@UseFilters(DatabaseErrorFilter)
@Controller('resources/atencion_clinica')
export class AtencionClinicaController {
  constructor(private readonly service: AtencionClinicaService) {}
  @Get()
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: getSchemaPath(AtencionClinicaResponseDto) },
        },
      },
    },
  })
  findAll(
    @Req() req: AuthenticatedRequest,
    @Headers('x-organization-id') org: string,
    @Query() query: ListQueryDto,
  ) {
    return this.service.findAll(
      req.identity,
      uuid(org, 'X-Organization-Id'),
      query,
    );
  }

  @Get(':id')
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: { data: { $ref: getSchemaPath(AtencionClinicaResponseDto) } },
    },
  })
  async findOne(
    @Req() req: AuthenticatedRequest,
    @Headers('x-organization-id') org: string,
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.service.findOne(
      req.identity,
      uuid(org, 'X-Organization-Id'),
      uuid(id),
    );
    if (typeof result.data.version === 'number')
      res.setHeader('ETag', `"${result.data.version}"`);
    return result;
  }

  @Post()
  @ApiHeader({ name: 'Idempotency-Key', required: true })
  @ApiCreatedResponse({
    schema: {
      type: 'object',
      properties: { data: { $ref: getSchemaPath(AtencionClinicaResponseDto) } },
    },
  })
  async create(
    @Req() req: AuthenticatedRequest,
    @Headers('x-organization-id') org: string,
    @Body() dto: CreateAtencionClinicaDto,
    @Headers('idempotency-key') key: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.service.create(
      req.identity,
      uuid(org, 'X-Organization-Id'),
      dto,
      uuid(key, 'Idempotency-Key'),
    );
    if (typeof result.data.version === 'number')
      res.setHeader('ETag', `"${result.data.version}"`);
    return result;
  }

  @Patch(':id')
  @ApiHeader({ name: 'If-Match', required: true })
  async update(
    @Req() req: AuthenticatedRequest,
    @Headers('x-organization-id') org: string,
    @Param('id') id: string,
    @Body() dto: UpdateAtencionClinicaDto,
    @Headers('if-match') version: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.service.update(
      req.identity,
      uuid(org, 'X-Organization-Id'),
      uuid(id),
      dto,
      version,
    );
    res.setHeader('ETag', `"${String(result.data.version)}"`);
    return result;
  }

  @ApiExcludeEndpoint()
  @Delete(':id')
  @HttpCode(204)
  @ApiHeader({ name: 'If-Match', required: true })
  async remove(
    @Req() req: AuthenticatedRequest,
    @Headers('x-organization-id') org: string,
    @Param('id') id: string,
    @Headers('if-match') version: string,
  ) {
    await this.service.remove(
      req.identity,
      uuid(org, 'X-Organization-Id'),
      uuid(id),
      version,
    );
  }
}
