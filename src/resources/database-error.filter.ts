import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch(QueryFailedError)
export class DatabaseErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(DatabaseErrorFilter.name);
  catch(error: QueryFailedError, host: ArgumentsHost) {
    const driver = error.driverError as { code?: string };
    const code = driver.code ?? 'unknown';
    const map: Record<string, [number, string]> = {
      '23505': [409, 'Ya existe un registro con esos datos'],
      '23503': [
        409,
        'La relacion no esta disponible o el registro tiene dependencias',
      ],
      '23514': [400, 'Los datos no cumplen las reglas del recurso'],
      '23502': [400, 'Faltan datos obligatorios'],
      '22P02': [400, 'Formato de dato invalido'],
      '22007': [400, 'Fecha invalida'],
      '42501': [403, 'Operacion no autorizada'],
      P0001: [
        409,
        'La operacion viola una regla del historial o del documento',
      ],
      '40001': [409, 'Conflicto concurrente; vuelva a consultar el registro'],
      '40P01': [409, 'Conflicto concurrente; reintente la operacion'],
      '57014': [503, 'Consulta excedio el tiempo disponible'],
    };
    const [status, message] = map[code] ?? [
      500,
      'No se pudo completar la operacion',
    ];
    this.logger.warn(`Database operation rejected (${code})`);
    host
      .switchToHttp()
      .getResponse<Response>()
      .status(status)
      .json({ statusCode: status, message });
  }
}
