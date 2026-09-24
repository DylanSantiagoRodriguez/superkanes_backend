import { FirmaConsentimientoEntity } from './entities/firma-consentimiento.entity';
import { Injectable } from '@nestjs/common';
import type { Identity } from '../../auth/token.service';
import { ResourcePersistenceService } from '../../resources/resource-persistence.service';
import { ListQueryDto } from '../../common/dto/list-query.dto';
import { CreateFirmaConsentimientoDto } from './dto/create-firma-consentimiento.dto';
import { UpdateFirmaConsentimientoDto } from './dto/update-firma-consentimiento.dto';

@Injectable()
export class FirmaConsentimientoService {
  constructor(private readonly persistence: ResourcePersistenceService) {}
  findAll(identity: Identity, organizationId: string, query: ListQueryDto) {
    return this.persistence.list(
      identity,
      organizationId,
      FirmaConsentimientoEntity,
      { ...query },
    );
  }
  findOne(identity: Identity, organizationId: string, id: string) {
    return this.persistence.get(
      identity,
      organizationId,
      FirmaConsentimientoEntity,
      id,
    );
  }
  create(
    identity: Identity,
    organizationId: string,
    dto: CreateFirmaConsentimientoDto,
    key: string,
  ) {
    return this.persistence.create(
      identity,
      organizationId,
      FirmaConsentimientoEntity,
      dto,
      key,
    );
  }
  update(
    identity: Identity,
    organizationId: string,
    id: string,
    dto: UpdateFirmaConsentimientoDto,
    version: string,
  ) {
    return this.persistence.update(
      identity,
      organizationId,
      FirmaConsentimientoEntity,
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
      FirmaConsentimientoEntity,
      id,
      version,
    );
  }
}
