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
import { ReporteEmitidoService } from './reporte-emitido.service';
import { ReporteEmitidoResponseDto } from './dto/reporte-emitido-response.dto';

@ApiTags('reporte_emitido')
@ApiBearerAuth()
@ApiHeader({ name: 'X-Organization-Id', required: true })
@ApiExtraModels(ReporteEmitidoResponseDto)
@UseFilters(DatabaseErrorFilter)
@Controller('resources/reporte_emitido')
export class ReporteEmitidoController {
  constructor(private readonly service: ReporteEmitidoService) {}
  @Get()
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: getSchemaPath(ReporteEmitidoResponseDto) },
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
      properties: { data: { $ref: getSchemaPath(ReporteEmitidoResponseDto) } },
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
