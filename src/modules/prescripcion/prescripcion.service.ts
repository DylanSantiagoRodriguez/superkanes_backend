import { PrescripcionEntity } from './entities/prescripcion.entity';
import { Injectable } from '@nestjs/common';
import type { Identity } from '../../auth/token.service';
import { ResourcePersistenceService } from '../../resources/resource-persistence.service';
import { ListQueryDto } from '../../common/dto/list-query.dto';
import { CreatePrescripcionDto } from './dto/create-prescripcion.dto';
import { UpdatePrescripcionDto } from './dto/update-prescripcion.dto';

@Injectable()
export class PrescripcionService {
  constructor(private readonly persistence: ResourcePersistenceService) {}
  findAll(identity: Identity, organizationId: string, query: ListQueryDto) {
    return this.persistence.list(identity, organizationId, PrescripcionEntity, {
      ...query,
    });
  }
  findOne(identity: Identity, organizationId: string, id: string) {
    return this.persistence.get(
      identity,
      organizationId,
      PrescripcionEntity,
      id,
    );
  }
  create(
    identity: Identity,
    organizationId: string,
    dto: CreatePrescripcionDto,
    key: string,
  ) {
    return this.persistence.create(
      identity,
      organizationId,
      PrescripcionEntity,
      dto,
      key,
    );
  }
  update(
    identity: Identity,
    organizationId: string,
    id: string,
    dto: UpdatePrescripcionDto,
    version: string,
  ) {
    return this.persistence.update(
      identity,
      organizationId,
      PrescripcionEntity,
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
      PrescripcionEntity,
      id,
      version,
    );
  }
}
