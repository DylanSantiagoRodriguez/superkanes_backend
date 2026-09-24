import { PrescripcionItemEntity } from './entities/prescripcion-item.entity';
import { Injectable } from '@nestjs/common';
import type { Identity } from '../../auth/token.service';
import { ResourcePersistenceService } from '../../resources/resource-persistence.service';
import { ListQueryDto } from '../../common/dto/list-query.dto';
import { CreatePrescripcionItemDto } from './dto/create-prescripcion-item.dto';
import { UpdatePrescripcionItemDto } from './dto/update-prescripcion-item.dto';

@Injectable()
export class PrescripcionItemService {
  constructor(private readonly persistence: ResourcePersistenceService) {}
  findAll(identity: Identity, organizationId: string, query: ListQueryDto) {
    return this.persistence.list(
      identity,
      organizationId,
      PrescripcionItemEntity,
      { ...query },
    );
  }
  findOne(identity: Identity, organizationId: string, id: string) {
    return this.persistence.get(
      identity,
      organizationId,
      PrescripcionItemEntity,
      id,
    );
  }
  create(
    identity: Identity,
    organizationId: string,
    dto: CreatePrescripcionItemDto,
    key: string,
  ) {
    return this.persistence.create(
      identity,
      organizationId,
      PrescripcionItemEntity,
      dto,
      key,
    );
  }
  update(
    identity: Identity,
    organizationId: string,
    id: string,
    dto: UpdatePrescripcionItemDto,
    version: string,
  ) {
    return this.persistence.update(
      identity,
      organizationId,
      PrescripcionItemEntity,
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
      PrescripcionItemEntity,
      id,
      version,
    );
  }
}
