import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import { DatabaseService } from '../database/database.service';
import { Public } from '../auth/auth.guard';

@ApiTags('Health')
@Public()
@Controller('health')
export class HealthController {
  constructor(private readonly database: DatabaseService) {}

  @Get('live')
  @ApiOkResponse({ description: 'El proceso HTTP responde.' })
  live() {
    return { status: 'ok', service: 'superkanes-api' };
  }

  @Get('ready')
  @ApiOkResponse({
    description:
      'PostgreSQL y el esquema están disponibles para la cuenta de aplicación.',
  })
  @ApiServiceUnavailableResponse({
    description: 'La base de datos no está disponible o no está inicializada.',
  })
  async ready() {
    try {
      await this.database.checkReadiness();
      return { status: 'ok', database: 'up' };
    } catch {
      throw new ServiceUnavailableException({
        status: 'error',
        database: 'unavailable',
      });
    }
  }
}
