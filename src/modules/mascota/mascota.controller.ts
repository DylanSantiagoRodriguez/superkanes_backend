import { TransferGuardianDto } from './dto/transfer-guardian.dto';
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
import { MascotaService } from './mascota.service';
import { MascotaResponseDto } from './dto/mascota-response.dto';
import { CreateMascotaDto } from './dto/create-mascota.dto';
import { UpdateMascotaDto } from './dto/update-mascota.dto';

@ApiTags('mascota')
@ApiBearerAuth()
@ApiHeader({ name: 'X-Organization-Id', required: true })
@ApiExtraModels(MascotaResponseDto)
@UseFilters(DatabaseErrorFilter)
@Controller('resources/mascota')
export class MascotaController {
  constructor(private readonly service: MascotaService) {}
  @Get()
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: getSchemaPath(MascotaResponseDto) },
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
      properties: { data: { $ref: getSchemaPath(MascotaResponseDto) } },
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
      properties: { data: { $ref: getSchemaPath(MascotaResponseDto) } },
    },
  })
  async create(
    @Req() req: AuthenticatedRequest,
    @Headers('x-organization-id') org: string,
    @Body() dto: CreateMascotaDto,
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
    @Body() dto: UpdateMascotaDto,
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
  @Patch(':id/tutor-principal')
  @ApiHeader({ name: 'If-Match', required: true })
  async transferGuardian(
    @Req() req: AuthenticatedRequest,
    @Headers('x-organization-id') org: string,
    @Param('id') id: string,
    @Body() dto: TransferGuardianDto,
    @Headers('if-match') version: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.service.transferGuardian(
      req.identity,
      uuid(org, 'X-Organization-Id'),
      uuid(id),
      dto,
      version,
    );
    res.setHeader('ETag', `"${String(result.data.version)}"`);
    return result;
  }
}
