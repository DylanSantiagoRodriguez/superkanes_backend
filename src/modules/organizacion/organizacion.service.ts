import { OrganizacionEntity } from './entities/organizacion.entity';
import { Injectable } from '@nestjs/common';
import type { Identity } from '../../auth/token.service';
import { ResourcePersistenceService } from '../../resources/resource-persistence.service';
import { ListQueryDto } from '../../common/dto/list-query.dto';
import { CreateOrganizacionDto } from './dto/create-organizacion.dto';
import { UpdateOrganizacionDto } from './dto/update-organizacion.dto';

@Injectable()
export class OrganizacionService {
  constructor(private readonly persistence: ResourcePersistenceService) {}
  findAll(identity: Identity, organizationId: string, query: ListQueryDto) {
    return this.persistence.list(identity, organizationId, OrganizacionEntity, {
      ...query,
    });
  }
  findOne(identity: Identity, organizationId: string, id: string) {
    return this.persistence.get(
      identity,
      organizationId,
      OrganizacionEntity,
      id,
    );
  }
  create(
    identity: Identity,
    organizationId: string,
    dto: CreateOrganizacionDto,
    key: string,
  ) {
    return this.persistence.create(
      identity,
      organizationId,
      OrganizacionEntity,
      dto,
      key,
    );
  }
  update(
    identity: Identity,
    organizationId: string,
    id: string,
    dto: UpdateOrganizacionDto,
    version: string,
  ) {
    return this.persistence.update(
      identity,
      organizationId,
      OrganizacionEntity,
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
      OrganizacionEntity,
      id,
      version,
    );
  }
}
