import { MedicamentoEntity } from './entities/medicamento.entity';
import { Injectable } from '@nestjs/common';
import type { Identity } from '../../auth/token.service';
import { ResourcePersistenceService } from '../../resources/resource-persistence.service';
import { ListQueryDto } from '../../common/dto/list-query.dto';
import { CreateMedicamentoDto } from './dto/create-medicamento.dto';
import { UpdateMedicamentoDto } from './dto/update-medicamento.dto';

@Injectable()
export class MedicamentoService {
  constructor(private readonly persistence: ResourcePersistenceService) {}
  findAll(identity: Identity, organizationId: string, query: ListQueryDto) {
    return this.persistence.list(identity, organizationId, MedicamentoEntity, {
      ...query,
    });
  }
  findOne(identity: Identity, organizationId: string, id: string) {
    return this.persistence.get(
      identity,
      organizationId,
      MedicamentoEntity,
      id,
    );
  }
  create(
    identity: Identity,
    organizationId: string,
    dto: CreateMedicamentoDto,
    key: string,
  ) {
    return this.persistence.create(
      identity,
      organizationId,
      MedicamentoEntity,
      dto,
      key,
    );
  }
  update(
    identity: Identity,
    organizationId: string,
    id: string,
    dto: UpdateMedicamentoDto,
    version: string,
  ) {
    return this.persistence.update(
      identity,
      organizationId,
      MedicamentoEntity,
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
      MedicamentoEntity,
      id,
      version,
    );
  }
}
