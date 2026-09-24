import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Query,
  Param,
  Headers,
  Req,
  Res,
  HttpCode,
  UseFilters,
  MethodNotAllowedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiHeader,
  ApiOkResponse,
  ApiExtraModels,
  ApiExcludeEndpoint,
  getSchemaPath,
} from '@nestjs/swagger';
import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../auth/auth.guard';
import { uuid } from '../../resources/resource-validation';
import { DatabaseErrorFilter } from '../../resources/database-error.filter';
import { ListQueryDto } from '../../common/dto/list-query.dto';
import { EventoAuditoriaService } from './evento-auditoria.service';
import { EventoAuditoriaResponseDto } from './dto/evento-auditoria-response.dto';

@ApiTags('evento_auditoria')
@ApiBearerAuth()
@ApiHeader({ name: 'X-Organization-Id', required: true })
@ApiExtraModels(EventoAuditoriaResponseDto)
@UseFilters(DatabaseErrorFilter)
@Controller('resources/evento_auditoria')
export class EventoAuditoriaController {
  constructor(private readonly service: EventoAuditoriaService) {}
  @Get()
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: getSchemaPath(EventoAuditoriaResponseDto) },
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
      properties: { data: { $ref: getSchemaPath(EventoAuditoriaResponseDto) } },
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
  @Post() @ApiExcludeEndpoint() create(): never {
    throw new MethodNotAllowedException('Recurso generado internamente');
  }
  @Patch(':id') @ApiExcludeEndpoint() update(): never {
    throw new MethodNotAllowedException('Registro inmutable');
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
