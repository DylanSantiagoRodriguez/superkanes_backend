import { DiagnosticoAtencionEntity } from './entities/diagnostico-atencion.entity';
import { Injectable } from '@nestjs/common';
import type { Identity } from '../../auth/token.service';
import { ResourcePersistenceService } from '../../resources/resource-persistence.service';
import { ListQueryDto } from '../../common/dto/list-query.dto';
import { CreateDiagnosticoAtencionDto } from './dto/create-diagnostico-atencion.dto';
import { UpdateDiagnosticoAtencionDto } from './dto/update-diagnostico-atencion.dto';

@Injectable()
export class DiagnosticoAtencionService {
  constructor(private readonly persistence: ResourcePersistenceService) {}
  findAll(identity: Identity, organizationId: string, query: ListQueryDto) {
    return this.persistence.list(
      identity,
      organizationId,
      DiagnosticoAtencionEntity,
      { ...query },
    );
  }
  findOne(identity: Identity, organizationId: string, id: string) {
    return this.persistence.get(
      identity,
      organizationId,
      DiagnosticoAtencionEntity,
      id,
    );
  }
  create(
    identity: Identity,
    organizationId: string,
    dto: CreateDiagnosticoAtencionDto,
    key: string,
  ) {
    return this.persistence.create(
      identity,
      organizationId,
      DiagnosticoAtencionEntity,
      dto,
      key,
    );
  }
  update(
    identity: Identity,
    organizationId: string,
    id: string,
    dto: UpdateDiagnosticoAtencionDto,
    version: string,
  ) {
    return this.persistence.update(
      identity,
      organizationId,
      DiagnosticoAtencionEntity,
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
      DiagnosticoAtencionEntity,
      id,
      version,
    );
  }
}
