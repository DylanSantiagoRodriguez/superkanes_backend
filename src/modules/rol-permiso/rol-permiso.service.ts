import { RolPermisoEntity } from './entities/rol-permiso.entity';
import { Injectable } from '@nestjs/common';
import type { Identity } from '../../auth/token.service';
import { ResourcePersistenceService } from '../../resources/resource-persistence.service';
import { ListQueryDto } from '../../common/dto/list-query.dto';
import { CreateRolPermisoDto } from './dto/create-rol-permiso.dto';
import { UpdateRolPermisoDto } from './dto/update-rol-permiso.dto';

@Injectable()
export class RolPermisoService {
  constructor(private readonly persistence: ResourcePersistenceService) {}
  findAll(identity: Identity, organizationId: string, query: ListQueryDto) {
    return this.persistence.list(identity, organizationId, RolPermisoEntity, {
      ...query,
    });
  }
  findOne(identity: Identity, organizationId: string, id: string) {
    return this.persistence.get(identity, organizationId, RolPermisoEntity, id);
  }
  create(
    identity: Identity,
    organizationId: string,
    dto: CreateRolPermisoDto,
    key: string,
  ) {
    return this.persistence.create(
      identity,
      organizationId,
      RolPermisoEntity,
      dto,
      key,
    );
  }
  update(
    identity: Identity,
    organizationId: string,
    id: string,
    dto: UpdateRolPermisoDto,
    version: string,
  ) {
    return this.persistence.update(
      identity,
      organizationId,
      RolPermisoEntity,
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
      RolPermisoEntity,
      id,
      version,
    );
  }
}
