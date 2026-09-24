import { VacunacionEntity } from './entities/vacunacion.entity';
import { Injectable } from '@nestjs/common';
import type { Identity } from '../../auth/token.service';
import { ResourcePersistenceService } from '../../resources/resource-persistence.service';
import { ListQueryDto } from '../../common/dto/list-query.dto';
import { CreateVacunacionDto } from './dto/create-vacunacion.dto';
import { UpdateVacunacionDto } from './dto/update-vacunacion.dto';

@Injectable()
export class VacunacionService {
  constructor(private readonly persistence: ResourcePersistenceService) {}
  findAll(identity: Identity, organizationId: string, query: ListQueryDto) {
    return this.persistence.list(identity, organizationId, VacunacionEntity, {
      ...query,
    });
  }
  findOne(identity: Identity, organizationId: string, id: string) {
    return this.persistence.get(identity, organizationId, VacunacionEntity, id);
  }
  create(
    identity: Identity,
    organizationId: string,
    dto: CreateVacunacionDto,
    key: string,
  ) {
    return this.persistence.create(
      identity,
      organizationId,
      VacunacionEntity,
      dto,
      key,
    );
  }
  update(
    identity: Identity,
    organizationId: string,
    id: string,
    dto: UpdateVacunacionDto,
    version: string,
  ) {
    return this.persistence.update(
      identity,
      organizationId,
      VacunacionEntity,
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
      VacunacionEntity,
      id,
      version,
    );
  }
}
