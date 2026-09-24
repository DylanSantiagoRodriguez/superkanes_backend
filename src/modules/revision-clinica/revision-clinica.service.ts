import { RevisionClinicaEntity } from './entities/revision-clinica.entity';
import { Injectable } from '@nestjs/common';
import type { Identity } from '../../auth/token.service';
import { ResourcePersistenceService } from '../../resources/resource-persistence.service';
import { ListQueryDto } from '../../common/dto/list-query.dto';
import { CreateRevisionClinicaDto } from './dto/create-revision-clinica.dto';
import { UpdateRevisionClinicaDto } from './dto/update-revision-clinica.dto';

@Injectable()
export class RevisionClinicaService {
  constructor(private readonly persistence: ResourcePersistenceService) {}
  findAll(identity: Identity, organizationId: string, query: ListQueryDto) {
    return this.persistence.list(
      identity,
      organizationId,
      RevisionClinicaEntity,
      { ...query },
    );
  }
  findOne(identity: Identity, organizationId: string, id: string) {
    return this.persistence.get(
      identity,
      organizationId,
      RevisionClinicaEntity,
      id,
    );
  }
  create(
    identity: Identity,
    organizationId: string,
    dto: CreateRevisionClinicaDto,
    key: string,
  ) {
    return this.persistence.create(
      identity,
      organizationId,
      RevisionClinicaEntity,
      dto,
      key,
    );
  }
  update(
    identity: Identity,
    organizationId: string,
    id: string,
    dto: UpdateRevisionClinicaDto,
    version: string,
  ) {
    return this.persistence.update(
      identity,
      organizationId,
      RevisionClinicaEntity,
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
      RevisionClinicaEntity,
      id,
      version,
    );
  }
}
