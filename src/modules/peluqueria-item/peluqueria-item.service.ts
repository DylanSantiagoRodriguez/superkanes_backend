import { PeluqueriaItemEntity } from './entities/peluqueria-item.entity';
import { Injectable } from '@nestjs/common';
import type { Identity } from '../../auth/token.service';
import { ResourcePersistenceService } from '../../resources/resource-persistence.service';
import { ListQueryDto } from '../../common/dto/list-query.dto';
import { CreatePeluqueriaItemDto } from './dto/create-peluqueria-item.dto';
import { UpdatePeluqueriaItemDto } from './dto/update-peluqueria-item.dto';

@Injectable()
export class PeluqueriaItemService {
  constructor(private readonly persistence: ResourcePersistenceService) {}
  findAll(identity: Identity, organizationId: string, query: ListQueryDto) {
    return this.persistence.list(
      identity,
      organizationId,
      PeluqueriaItemEntity,
      { ...query },
    );
  }
  findOne(identity: Identity, organizationId: string, id: string) {
    return this.persistence.get(
      identity,
      organizationId,
      PeluqueriaItemEntity,
      id,
    );
  }
  create(
    identity: Identity,
    organizationId: string,
    dto: CreatePeluqueriaItemDto,
    key: string,
  ) {
    return this.persistence.create(
      identity,
      organizationId,
      PeluqueriaItemEntity,
      dto,
      key,
    );
  }
  update(
    identity: Identity,
    organizationId: string,
    id: string,
    dto: UpdatePeluqueriaItemDto,
    version: string,
  ) {
    return this.persistence.update(
      identity,
      organizationId,
      PeluqueriaItemEntity,
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
      PeluqueriaItemEntity,
      id,
      version,
    );
  }
}
