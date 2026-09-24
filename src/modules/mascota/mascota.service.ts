import { MascotaEntity } from './entities/mascota.entity';
import { TransferGuardianDto } from './dto/transfer-guardian.dto';
import { Injectable } from '@nestjs/common';
import type { Identity } from '../../auth/token.service';
import { ResourcePersistenceService } from '../../resources/resource-persistence.service';
import { ListQueryDto } from '../../common/dto/list-query.dto';
import { CreateMascotaDto } from './dto/create-mascota.dto';
import { UpdateMascotaDto } from './dto/update-mascota.dto';

@Injectable()
export class MascotaService {
  constructor(private readonly persistence: ResourcePersistenceService) {}
  findAll(identity: Identity, organizationId: string, query: ListQueryDto) {
    return this.persistence.list(identity, organizationId, MascotaEntity, {
      ...query,
    });
  }
  findOne(identity: Identity, organizationId: string, id: string) {
    return this.persistence.get(identity, organizationId, MascotaEntity, id);
  }
  create(
    identity: Identity,
    organizationId: string,
    dto: CreateMascotaDto,
    key: string,
  ) {
    return this.persistence.create(
      identity,
      organizationId,
      MascotaEntity,
      dto,
      key,
    );
  }
  update(
    identity: Identity,
    organizationId: string,
    id: string,
    dto: UpdateMascotaDto,
    version: string,
  ) {
    return this.persistence.update(
      identity,
      organizationId,
      MascotaEntity,
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
      MascotaEntity,
      id,
      version,
    );
  }
  transferGuardian(
    identity: Identity,
    organizationId: string,
    id: string,
    dto: TransferGuardianDto,
    version: string,
  ) {
    return this.persistence.transferGuardian(
      identity,
      organizationId,
      id,
      dto,
      version,
    );
  }
}
