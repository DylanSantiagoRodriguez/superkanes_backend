import {
  Controller,
  Get,
  Post,
  Headers,
  Param,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
  StreamableFile,
  UseFilters,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiHeader,
  ApiTags,
  ApiBody,
} from '@nestjs/swagger';
import type { Response } from 'express';
import type { AuthenticatedRequest } from '../auth/auth.guard';
import { uuid } from '../resources/resource-validation';
import { DatabaseErrorFilter } from '../resources/database-error.filter';
import { StorageService } from './storage.service';

@ApiTags('storage')
@ApiBearerAuth()
@ApiHeader({ name: 'X-Organization-Id', required: true })
@UseFilters(DatabaseErrorFilter)
@Controller('storage')
export class StorageController {
  constructor(private readonly storage: StorageService) {}
  @Post('photos')
  @ApiConsumes('multipart/form-data')
  @ApiHeader({ name: 'Idempotency-Key', required: true })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024, files: 1, fields: 0 },
    }),
  )
  upload(
    @Req() req: AuthenticatedRequest,
    @Headers('x-organization-id') org: string,
    @Headers('idempotency-key') key: string,
    @UploadedFile() file?: { buffer: Buffer; originalname: string },
  ) {
    return this.storage.upload(
      req.identity,
      uuid(org, 'X-Organization-Id'),
      uuid(key, 'Idempotency-Key'),
      file,
    );
  }
  @Get(':id/content')
  async content(
    @Req() req: AuthenticatedRequest,
    @Headers('x-organization-id') org: string,
    @Param('id') id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const buffer = await this.storage.content(
      req.identity,
      uuid(org, 'X-Organization-Id'),
      uuid(id),
    );
    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    return new StreamableFile(buffer, {
      type: 'image/webp',
      disposition: 'inline; filename="paciente.webp"',
      length: buffer.length,
    });
  }
}
