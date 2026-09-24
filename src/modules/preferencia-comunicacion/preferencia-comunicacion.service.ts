import { PreferenciaComunicacionEntity } from './entities/preferencia-comunicacion.entity';
import { Injectable } from '@nestjs/common';
import type { Identity } from '../../auth/token.service';
import { ResourcePersistenceService } from '../../resources/resource-persistence.service';
import { ListQueryDto } from '../../common/dto/list-query.dto';
import { CreatePreferenciaComunicacionDto } from './dto/create-preferencia-comunicacion.dto';
import { UpdatePreferenciaComunicacionDto } from './dto/update-preferencia-comunicacion.dto';

@Injectable()
export class PreferenciaComunicacionService {
  constructor(private readonly persistence: ResourcePersistenceService) {}
  findAll(identity: Identity, organizationId: string, query: ListQueryDto) {
    return this.persistence.list(
      identity,
      organizationId,
      PreferenciaComunicacionEntity,
      { ...query },
    );
  }
  findOne(identity: Identity, organizationId: string, id: string) {
    return this.persistence.get(
      identity,
      organizationId,
      PreferenciaComunicacionEntity,
      id,
    );
  }
  create(
    identity: Identity,
    organizationId: string,
    dto: CreatePreferenciaComunicacionDto,
    key: string,
  ) {
    return this.persistence.create(
      identity,
      organizationId,
      PreferenciaComunicacionEntity,
      dto,
      key,
    );
  }
  update(
    identity: Identity,
    organizationId: string,
    id: string,
    dto: UpdatePreferenciaComunicacionDto,
    version: string,
  ) {
    return this.persistence.update(
      identity,
      organizationId,
      PreferenciaComunicacionEntity,
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
      PreferenciaComunicacionEntity,
      id,
      version,
    );
  }
}
