import { DiagnosticoEntity } from './entities/diagnostico.entity';
import { Injectable } from '@nestjs/common';
import type { Identity } from '../../auth/token.service';
import { ResourcePersistenceService } from '../../resources/resource-persistence.service';
import { ListQueryDto } from '../../common/dto/list-query.dto';
import { CreateDiagnosticoDto } from './dto/create-diagnostico.dto';
import { UpdateDiagnosticoDto } from './dto/update-diagnostico.dto';

@Injectable()
export class DiagnosticoService {
  constructor(private readonly persistence: ResourcePersistenceService) {}
  findAll(identity: Identity, organizationId: string, query: ListQueryDto) {
    return this.persistence.list(identity, organizationId, DiagnosticoEntity, {
      ...query,
    });
  }
  findOne(identity: Identity, organizationId: string, id: string) {
    return this.persistence.get(
      identity,
      organizationId,
      DiagnosticoEntity,
      id,
    );
  }
  create(
    identity: Identity,
    organizationId: string,
    dto: CreateDiagnosticoDto,
    key: string,
  ) {
    return this.persistence.create(
      identity,
      organizationId,
      DiagnosticoEntity,
      dto,
      key,
    );
  }
  update(
    identity: Identity,
    organizationId: string,
    id: string,
    dto: UpdateDiagnosticoDto,
    version: string,
  ) {
    return this.persistence.update(
      identity,
      organizationId,
      DiagnosticoEntity,
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
      DiagnosticoEntity,
      id,
      version,
    );
  }
}
