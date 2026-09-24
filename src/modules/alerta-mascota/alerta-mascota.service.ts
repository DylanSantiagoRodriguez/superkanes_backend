import { AlertaMascotaEntity } from './entities/alerta-mascota.entity';
import { Injectable } from '@nestjs/common';
import type { Identity } from '../../auth/token.service';
import { ResourcePersistenceService } from '../../resources/resource-persistence.service';
import { ListQueryDto } from '../../common/dto/list-query.dto';
import { CreateAlertaMascotaDto } from './dto/create-alerta-mascota.dto';
import { UpdateAlertaMascotaDto } from './dto/update-alerta-mascota.dto';

@Injectable()
export class AlertaMascotaService {
  constructor(private readonly persistence: ResourcePersistenceService) {}
  findAll(identity: Identity, organizationId: string, query: ListQueryDto) {
    return this.persistence.list(
      identity,
      organizationId,
      AlertaMascotaEntity,
      { ...query },
    );
  }
  findOne(identity: Identity, organizationId: string, id: string) {
    return this.persistence.get(
      identity,
      organizationId,
      AlertaMascotaEntity,
      id,
    );
  }
  create(
    identity: Identity,
    organizationId: string,
    dto: CreateAlertaMascotaDto,
    key: string,
  ) {
    return this.persistence.create(
      identity,
      organizationId,
      AlertaMascotaEntity,
      dto,
      key,
    );
  }
  update(
    identity: Identity,
    organizationId: string,
    id: string,
    dto: UpdateAlertaMascotaDto,
    version: string,
  ) {
    return this.persistence.update(
      identity,
      organizationId,
      AlertaMascotaEntity,
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
      AlertaMascotaEntity,
      id,
      version,
    );
  }
}
