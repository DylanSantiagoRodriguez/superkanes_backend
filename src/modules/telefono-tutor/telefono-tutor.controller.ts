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
import { TelefonoTutorService } from './telefono-tutor.service';
import { TelefonoTutorResponseDto } from './dto/telefono-tutor-response.dto';
import { CreateTelefonoTutorDto } from './dto/create-telefono-tutor.dto';
import { UpdateTelefonoTutorDto } from './dto/update-telefono-tutor.dto';

@ApiTags('telefono_tutor')
@ApiBearerAuth()
@ApiHeader({ name: 'X-Organization-Id', required: true })
@ApiExtraModels(TelefonoTutorResponseDto)
@UseFilters(DatabaseErrorFilter)
@Controller('resources/telefono_tutor')
export class TelefonoTutorController {
  constructor(private readonly service: TelefonoTutorService) {}
  @Get()
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: getSchemaPath(TelefonoTutorResponseDto) },
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
      properties: { data: { $ref: getSchemaPath(TelefonoTutorResponseDto) } },
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
      properties: { data: { $ref: getSchemaPath(TelefonoTutorResponseDto) } },
    },
  })
  async create(
    @Req() req: AuthenticatedRequest,
    @Headers('x-organization-id') org: string,
    @Body() dto: CreateTelefonoTutorDto,
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
    @Body() dto: UpdateTelefonoTutorDto,
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
}
