import { RecordatorioEntity } from './entities/recordatorio.entity';
import { Injectable } from '@nestjs/common';
import type { Identity } from '../../auth/token.service';
import { ResourcePersistenceService } from '../../resources/resource-persistence.service';
import { ListQueryDto } from '../../common/dto/list-query.dto';
import { CreateRecordatorioDto } from './dto/create-recordatorio.dto';
import { UpdateRecordatorioDto } from './dto/update-recordatorio.dto';

@Injectable()
export class RecordatorioService {
  constructor(private readonly persistence: ResourcePersistenceService) {}
  findAll(identity: Identity, organizationId: string, query: ListQueryDto) {
    return this.persistence.list(identity, organizationId, RecordatorioEntity, {
      ...query,
    });
  }
  findOne(identity: Identity, organizationId: string, id: string) {
    return this.persistence.get(
      identity,
      organizationId,
      RecordatorioEntity,
      id,
    );
  }
  create(
    identity: Identity,
    organizationId: string,
    dto: CreateRecordatorioDto,
    key: string,
  ) {
    return this.persistence.create(
      identity,
      organizationId,
      RecordatorioEntity,
      dto,
      key,
    );
  }
  update(
    identity: Identity,
    organizationId: string,
    id: string,
    dto: UpdateRecordatorioDto,
    version: string,
  ) {
    return this.persistence.update(
      identity,
      organizationId,
      RecordatorioEntity,
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
      RecordatorioEntity,
      id,
      version,
    );
  }
}
