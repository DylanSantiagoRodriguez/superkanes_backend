import { AsignacionRolEntity } from './entities/asignacion-rol.entity';
import { Injectable } from '@nestjs/common';
import type { Identity } from '../../auth/token.service';
import { ResourcePersistenceService } from '../../resources/resource-persistence.service';
import { ListQueryDto } from '../../common/dto/list-query.dto';
import { CreateAsignacionRolDto } from './dto/create-asignacion-rol.dto';
import { UpdateAsignacionRolDto } from './dto/update-asignacion-rol.dto';

@Injectable()
export class AsignacionRolService {
  constructor(private readonly persistence: ResourcePersistenceService) {}
  findAll(identity: Identity, organizationId: string, query: ListQueryDto) {
    return this.persistence.list(
      identity,
      organizationId,
      AsignacionRolEntity,
      { ...query },
    );
  }
  findOne(identity: Identity, organizationId: string, id: string) {
    return this.persistence.get(
      identity,
      organizationId,
      AsignacionRolEntity,
      id,
    );
  }
  create(
    identity: Identity,
    organizationId: string,
    dto: CreateAsignacionRolDto,
    key: string,
  ) {
    return this.persistence.create(
      identity,
      organizationId,
      AsignacionRolEntity,
      dto,
      key,
    );
  }
  update(
    identity: Identity,
    organizationId: string,
    id: string,
    dto: UpdateAsignacionRolDto,
    version: string,
  ) {
    return this.persistence.update(
      identity,
      organizationId,
      AsignacionRolEntity,
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
      AsignacionRolEntity,
      id,
      version,
    );
  }
}
