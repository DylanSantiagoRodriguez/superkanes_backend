import { ReporteEmitidoEntity } from './entities/reporte-emitido.entity';
import { Injectable } from '@nestjs/common';
import type { Identity } from '../../auth/token.service';
import { ResourcePersistenceService } from '../../resources/resource-persistence.service';
import { ListQueryDto } from '../../common/dto/list-query.dto';
import { CreateReporteEmitidoDto } from './dto/create-reporte-emitido.dto';
import { UpdateReporteEmitidoDto } from './dto/update-reporte-emitido.dto';

@Injectable()
export class ReporteEmitidoService {
  constructor(private readonly persistence: ResourcePersistenceService) {}
  findAll(identity: Identity, organizationId: string, query: ListQueryDto) {
    return this.persistence.list(
      identity,
      organizationId,
      ReporteEmitidoEntity,
      { ...query },
    );
  }
  findOne(identity: Identity, organizationId: string, id: string) {
    return this.persistence.get(
      identity,
      organizationId,
      ReporteEmitidoEntity,
      id,
    );
  }
  create(
    identity: Identity,
    organizationId: string,
    dto: CreateReporteEmitidoDto,
    key: string,
  ) {
    return this.persistence.create(
      identity,
      organizationId,
      ReporteEmitidoEntity,
      dto,
      key,
    );
  }
  update(
    identity: Identity,
    organizationId: string,
    id: string,
    dto: UpdateReporteEmitidoDto,
    version: string,
  ) {
    return this.persistence.update(
      identity,
      organizationId,
      ReporteEmitidoEntity,
      id,
      dto,
      version,
    );
  }
  remove(
    identity: Identity,
    organizationId: string,
    id: string,
    version: string,
  ) {
    return this.persistence.delete(
      identity,
      organizationId,
      ReporteEmitidoEntity,
      id,
      version,
    );
  }
}
