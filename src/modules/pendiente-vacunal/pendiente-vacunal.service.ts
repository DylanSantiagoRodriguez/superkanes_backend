import { PendienteVacunalEntity } from './entities/pendiente-vacunal.entity';
import { Injectable } from '@nestjs/common';
import type { Identity } from '../../auth/token.service';
import { ResourcePersistenceService } from '../../resources/resource-persistence.service';
import { ListQueryDto } from '../../common/dto/list-query.dto';
import { CreatePendienteVacunalDto } from './dto/create-pendiente-vacunal.dto';
import { UpdatePendienteVacunalDto } from './dto/update-pendiente-vacunal.dto';

@Injectable()
export class PendienteVacunalService {
  constructor(private readonly persistence: ResourcePersistenceService) {}
  findAll(identity: Identity, organizationId: string, query: ListQueryDto) {
    return this.persistence.list(
      identity,
      organizationId,
      PendienteVacunalEntity,
      { ...query },
    );
  }
  findOne(identity: Identity, organizationId: string, id: string) {
    return this.persistence.get(
      identity,
      organizationId,
      PendienteVacunalEntity,
      id,
    );
  }
  create(
    identity: Identity,
    organizationId: string,
    dto: CreatePendienteVacunalDto,
    key: string,
  ) {
    return this.persistence.create(
      identity,
      organizationId,
      PendienteVacunalEntity,
      dto,
      key,
    );
  }
  update(
    identity: Identity,
    organizationId: string,
    id: string,
    dto: UpdatePendienteVacunalDto,
    version: string,
  ) {
    return this.persistence.update(
      identity,
      organizationId,
      PendienteVacunalEntity,
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
      PendienteVacunalEntity,
      id,
      version,
    );
  }
}
