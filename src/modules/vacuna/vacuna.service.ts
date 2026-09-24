import { VacunaEntity } from './entities/vacuna.entity';
import { Injectable } from '@nestjs/common';
import type { Identity } from '../../auth/token.service';
import { ResourcePersistenceService } from '../../resources/resource-persistence.service';
import { ListQueryDto } from '../../common/dto/list-query.dto';
import { CreateVacunaDto } from './dto/create-vacuna.dto';
import { UpdateVacunaDto } from './dto/update-vacuna.dto';

@Injectable()
export class VacunaService {
  constructor(private readonly persistence: ResourcePersistenceService) {}
  findAll(identity: Identity, organizationId: string, query: ListQueryDto) {
    return this.persistence.list(identity, organizationId, VacunaEntity, {
      ...query,
    });
  }
  findOne(identity: Identity, organizationId: string, id: string) {
    return this.persistence.get(identity, organizationId, VacunaEntity, id);
  }
  create(
    identity: Identity,
    organizationId: string,
    dto: CreateVacunaDto,
    key: string,
  ) {
    return this.persistence.create(
      identity,
      organizationId,
      VacunaEntity,
      dto,
      key,
    );
  }
  update(
    identity: Identity,
    organizationId: string,
    id: string,
    dto: UpdateVacunaDto,
    version: string,
  ) {
    return this.persistence.update(
      identity,
      organizationId,
      VacunaEntity,
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
      VacunaEntity,
      id,
      version,
    );
  }
}
