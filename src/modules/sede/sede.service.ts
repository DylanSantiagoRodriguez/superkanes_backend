import { SedeEntity } from './entities/sede.entity';
import { Injectable } from '@nestjs/common';
import type { Identity } from '../../auth/token.service';
import { ResourcePersistenceService } from '../../resources/resource-persistence.service';
import { ListQueryDto } from '../../common/dto/list-query.dto';
import { CreateSedeDto } from './dto/create-sede.dto';
import { UpdateSedeDto } from './dto/update-sede.dto';

@Injectable()
export class SedeService {
  constructor(private readonly persistence: ResourcePersistenceService) {}
  findAll(identity: Identity, organizationId: string, query: ListQueryDto) {
    return this.persistence.list(identity, organizationId, SedeEntity, {
      ...query,
    });
  }
  findOne(identity: Identity, organizationId: string, id: string) {
    return this.persistence.get(identity, organizationId, SedeEntity, id);
  }
  create(
    identity: Identity,
    organizationId: string,
    dto: CreateSedeDto,
    key: string,
  ) {
    return this.persistence.create(
      identity,
      organizationId,
      SedeEntity,
      dto,
      key,
    );
  }
  update(
    identity: Identity,
    organizationId: string,
    id: string,
    dto: UpdateSedeDto,
    version: string,
  ) {
    return this.persistence.update(
      identity,
      organizationId,
      SedeEntity,
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
      SedeEntity,
      id,
      version,
    );
  }
}
