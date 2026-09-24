import { TipoServicioEntity } from './entities/tipo-servicio.entity';
import { Injectable } from '@nestjs/common';
import type { Identity } from '../../auth/token.service';
import { ResourcePersistenceService } from '../../resources/resource-persistence.service';
import { ListQueryDto } from '../../common/dto/list-query.dto';
import { CreateTipoServicioDto } from './dto/create-tipo-servicio.dto';
import { UpdateTipoServicioDto } from './dto/update-tipo-servicio.dto';

@Injectable()
export class TipoServicioService {
  constructor(private readonly persistence: ResourcePersistenceService) {}
  findAll(identity: Identity, organizationId: string, query: ListQueryDto) {
    return this.persistence.list(identity, organizationId, TipoServicioEntity, {
      ...query,
    });
  }
  findOne(identity: Identity, organizationId: string, id: string) {
    return this.persistence.get(
      identity,
      organizationId,
      TipoServicioEntity,
      id,
    );
  }
  create(
    identity: Identity,
    organizationId: string,
    dto: CreateTipoServicioDto,
    key: string,
  ) {
    return this.persistence.create(
      identity,
      organizationId,
      TipoServicioEntity,
      dto,
      key,
    );
  }
  update(
    identity: Identity,
    organizationId: string,
    id: string,
    dto: UpdateTipoServicioDto,
    version: string,
  ) {
    return this.persistence.update(
      identity,
      organizationId,
      TipoServicioEntity,
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
      TipoServicioEntity,
      id,
      version,
    );
  }
}
