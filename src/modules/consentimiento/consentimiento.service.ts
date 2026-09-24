import { ConsentimientoEntity } from './entities/consentimiento.entity';
import { Injectable } from '@nestjs/common';
import type { Identity } from '../../auth/token.service';
import { ResourcePersistenceService } from '../../resources/resource-persistence.service';
import { ListQueryDto } from '../../common/dto/list-query.dto';
import { CreateConsentimientoDto } from './dto/create-consentimiento.dto';
import { UpdateConsentimientoDto } from './dto/update-consentimiento.dto';

@Injectable()
export class ConsentimientoService {
  constructor(private readonly persistence: ResourcePersistenceService) {}
  findAll(identity: Identity, organizationId: string, query: ListQueryDto) {
    return this.persistence.list(
      identity,
      organizationId,
      ConsentimientoEntity,
      { ...query },
    );
  }
  findOne(identity: Identity, organizationId: string, id: string) {
    return this.persistence.get(
      identity,
      organizationId,
      ConsentimientoEntity,
      id,
    );
  }
  create(
    identity: Identity,
    organizationId: string,
    dto: CreateConsentimientoDto,
    key: string,
  ) {
    return this.persistence.create(
      identity,
      organizationId,
      ConsentimientoEntity,
      dto,
      key,
    );
  }
  update(
    identity: Identity,
    organizationId: string,
    id: string,
    dto: UpdateConsentimientoDto,
    version: string,
  ) {
    return this.persistence.update(
      identity,
      organizationId,
      ConsentimientoEntity,
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
      ConsentimientoEntity,
      id,
      version,
    );
  }
}
