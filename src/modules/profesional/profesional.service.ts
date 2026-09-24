import { ProfesionalEntity } from './entities/profesional.entity';
import { Injectable } from '@nestjs/common';
import type { Identity } from '../../auth/token.service';
import { ResourcePersistenceService } from '../../resources/resource-persistence.service';
import { ListQueryDto } from '../../common/dto/list-query.dto';
import { CreateProfesionalDto } from './dto/create-profesional.dto';
import { UpdateProfesionalDto } from './dto/update-profesional.dto';

@Injectable()
export class ProfesionalService {
  constructor(private readonly persistence: ResourcePersistenceService) {}
  findAll(identity: Identity, organizationId: string, query: ListQueryDto) {
    return this.persistence.list(identity, organizationId, ProfesionalEntity, {
      ...query,
    });
  }
  findOne(identity: Identity, organizationId: string, id: string) {
    return this.persistence.get(
      identity,
      organizationId,
      ProfesionalEntity,
      id,
    );
  }
  create(
    identity: Identity,
    organizationId: string,
    dto: CreateProfesionalDto,
    key: string,
  ) {
    return this.persistence.create(
      identity,
      organizationId,
      ProfesionalEntity,
      dto,
      key,
    );
  }
  update(
    identity: Identity,
    organizationId: string,
    id: string,
    dto: UpdateProfesionalDto,
    version: string,
  ) {
    return this.persistence.update(
      identity,
      organizationId,
      ProfesionalEntity,
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
      ProfesionalEntity,
      id,
      version,
    );
  }
}
