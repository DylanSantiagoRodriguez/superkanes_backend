import { LaboratorioEntity } from './entities/laboratorio.entity';
import { Injectable } from '@nestjs/common';
import type { Identity } from '../../auth/token.service';
import { ResourcePersistenceService } from '../../resources/resource-persistence.service';
import { ListQueryDto } from '../../common/dto/list-query.dto';
import { CreateLaboratorioDto } from './dto/create-laboratorio.dto';
import { UpdateLaboratorioDto } from './dto/update-laboratorio.dto';

@Injectable()
export class LaboratorioService {
  constructor(private readonly persistence: ResourcePersistenceService) {}
  findAll(identity: Identity, organizationId: string, query: ListQueryDto) {
    return this.persistence.list(identity, organizationId, LaboratorioEntity, {
      ...query,
    });
  }
  findOne(identity: Identity, organizationId: string, id: string) {
    return this.persistence.get(
      identity,
      organizationId,
      LaboratorioEntity,
      id,
    );
  }
  create(
    identity: Identity,
    organizationId: string,
    dto: CreateLaboratorioDto,
    key: string,
  ) {
    return this.persistence.create(
      identity,
      organizationId,
      LaboratorioEntity,
      dto,
      key,
    );
  }
  update(
    identity: Identity,
    organizationId: string,
    id: string,
    dto: UpdateLaboratorioDto,
    version: string,
  ) {
    return this.persistence.update(
      identity,
      organizationId,
      LaboratorioEntity,
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
      LaboratorioEntity,
      id,
      version,
    );
  }
}
