import {
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Req,
  Res,
  StreamableFile,
  UploadedFile,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiHeader,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import type { AuthenticatedRequest } from '../auth/auth.guard';
import { uuid } from '../resources/resource-validation';
import { DatabaseErrorFilter } from '../resources/database-error.filter';
import { ClinicalDocumentsService } from './clinical-documents.service';
@ApiTags('documentos-clinicos')
@ApiBearerAuth()
@ApiHeader({ name: 'X-Organization-Id', required: true })
@UseFilters(DatabaseErrorFilter)
@Controller('storage/clinical')
export class ClinicalDocumentsController {
  constructor(private readonly service: ClinicalDocumentsService) {}
  @Post('revisiones/:id/adjuntos')
  @ApiConsumes('multipart/form-data')
  @ApiHeader({ name: 'Idempotency-Key', required: true })
  @ApiHeader({ name: 'If-Match', required: true })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024, files: 1, fields: 0 },
    }),
  )
  upload(
    @Req() req: AuthenticatedRequest,
    @Headers('x-organization-id') org: string,
    @Param('id') id: string,
    @Headers('idempotency-key') key: string,
    @Headers('if-match') version: string,
    @UploadedFile() file?: { buffer: Buffer; originalname: string },
  ) {
    return this.service.upload(
      req.identity,
      uuid(org),
      uuid(id),
      uuid(key),
      version,
      file,
    );
  }
  @Post('revisiones/:id/reportes/:type')
  @ApiHeader({ name: 'Idempotency-Key', required: true })
  report(
    @Req() req: AuthenticatedRequest,
    @Headers('x-organization-id') org: string,
    @Param('id') id: string,
    @Param('type') type: string,
    @Headers('idempotency-key') key: string,
  ) {
    return this.service.report(
      req.identity,
      uuid(org),
      uuid(id),
      type,
      uuid(key),
    );
  }
  @Get(':id/content')
  async content(
    @Req() req: AuthenticatedRequest,
    @Headers('x-organization-id') org: string,
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const data = await this.service.download(req.identity, uuid(org), uuid(id));
    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    return new StreamableFile(data.buffer, {
      type: data.mime,
      length: data.buffer.length,
      disposition: `attachment; filename="documento"; filename*=UTF-8''${encodeURIComponent(data.name)}`,
    });
  }
}
