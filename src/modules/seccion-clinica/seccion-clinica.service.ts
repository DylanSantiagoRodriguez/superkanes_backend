import { SeccionClinicaEntity } from './entities/seccion-clinica.entity';
import { Injectable } from '@nestjs/common';
import type { Identity } from '../../auth/token.service';
import { ResourcePersistenceService } from '../../resources/resource-persistence.service';
import { ListQueryDto } from '../../common/dto/list-query.dto';
import { CreateSeccionClinicaDto } from './dto/create-seccion-clinica.dto';
import { UpdateSeccionClinicaDto } from './dto/update-seccion-clinica.dto';

@Injectable()
export class SeccionClinicaService {
  constructor(private readonly persistence: ResourcePersistenceService) {}
  findAll(identity: Identity, organizationId: string, query: ListQueryDto) {
    return this.persistence.list(
      identity,
      organizationId,
      SeccionClinicaEntity,
      { ...query },
    );
  }
  findOne(identity: Identity, organizationId: string, id: string) {
    return this.persistence.get(
      identity,
      organizationId,
      SeccionClinicaEntity,
      id,
    );
  }
  create(
    identity: Identity,
    organizationId: string,
    dto: CreateSeccionClinicaDto,
    key: string,
  ) {
    return this.persistence.create(
      identity,
      organizationId,
      SeccionClinicaEntity,
      dto,
      key,
    );
  }
  update(
    identity: Identity,
    organizationId: string,
    id: string,
    dto: UpdateSeccionClinicaDto,
    version: string,
  ) {
    return this.persistence.update(
      identity,
      organizationId,
      SeccionClinicaEntity,
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
      SeccionClinicaEntity,
      id,
      version,
    );
  }
}
