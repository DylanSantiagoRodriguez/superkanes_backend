import { EntityManager } from 'typeorm';
import type { Access } from '../resources/resource-access.service';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { createHash, randomUUID } from 'node:crypto';
import sharp from 'sharp';
import { ResourceAccessService } from '../resources/resource-access.service';
import { ResourcePersistenceService } from '../resources/resource-persistence.service';
import { resource, Row } from '../resources/resource-registry';
import { ArchivoEntity } from '../modules/archivo/entities/archivo.entity';
import type { Identity } from '../auth/token.service';

export async function normalizePhoto(buffer: Buffer): Promise<Buffer> {
  try {
    const picture = sharp(buffer, {
      limitInputPixels: 40000000,
      failOn: 'warning',
    });
    const metadata = await picture.metadata();
    if (
      !['jpeg', 'png', 'webp'].includes(metadata.format ?? '') ||
      (metadata.pages ?? 1) !== 1
    )
      throw new Error('format');
    return await picture
      .rotate()
      .resize({
        width: 2400,
        height: 2400,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 85 })
      .toBuffer();
  } catch {
    throw new BadRequestException(
      'Selecciona una foto JPEG, PNG o WebP válida, sin animación y de hasta 40 megapíxeles',
    );
  }
}

@Injectable()
export class StorageService {
  private readonly client?: S3Client;
  private readonly bucket: string;
  constructor(
    private readonly config: ConfigService,
    private readonly access: ResourceAccessService,
    private readonly persistence: ResourcePersistenceService,
  ) {
    this.bucket = config.getOrThrow<string>('S3_BUCKET');
    if (config.get<boolean>('S3_ENABLED'))
      this.client = new S3Client({
        endpoint: config.getOrThrow<string>('S3_ENDPOINT'),
        region: config.getOrThrow<string>('S3_REGION'),
        forcePathStyle: true,
        credentials: {
          accessKeyId: config.getOrThrow<string>('S3_ACCESS_KEY'),
          secretAccessKey: config.getOrThrow<string>('S3_SECRET_KEY'),
        },
        maxAttempts: 2,
        requestHandler: { requestTimeout: 10000, connectionTimeout: 3000 },
      });
  }
  private storage() {
    if (!this.client)
      throw new ServiceUnavailableException('Almacenamiento no configurado');
    return this.client;
  }
  async upload(
    identity: Identity,
    org: string,
    key: string,
    file?: { buffer: Buffer; originalname: string },
  ) {
    const client = this.storage();
    if (!file?.buffer.length)
      throw new BadRequestException('Selecciona una foto');
    // Authorize before image decoding or any storage operation.
    return this.access.run(identity, org, async (manager, access) => {
      const r = resource('archivo');
      for (const action of ['create', 'read'] as const)
        this.access.scopeSql(
          r,
          'r',
          this.access.authorize(access, r, action),
          [],
        );
      const name =
        Array.from(file.originalname)
          .map((c) =>
            c.charCodeAt(0) < 32 ||
            c.charCodeAt(0) === 127 ||
            c === '/' ||
            c === '\\'
              ? '_'
              : c,
          )
          .join('')
          .slice(0, 180) || 'paciente';
      const hash = createHash('sha256')
        .update(file.buffer)
        .update(name)
        .digest('hex');
      await manager.query(
        'SELECT pg_advisory_xact_lock(hashtextextended($1,0))',
        [`${org}:${access.userId}:${key}`],
      );
      const previous: {
        request_hash: string;
        resource: string;
        response: Row;
      }[] = await manager.query(
        'SELECT request_hash,resource,response FROM api.idempotency WHERE organizacion_id=$1 AND usuario_id=$2 AND key=$3 AND expires_at>now()',
        [org, access.userId, key],
      );
      if (previous[0]) {
        if (
          previous[0].resource !== 'photo-upload' ||
          previous[0].request_hash !== hash
        )
          throw new ConflictException('Idempotency-Key ya utilizado');
        return { data: previous[0].response };
      }
      const buffer = await normalizePhoto(file.buffer);
      const id = randomUUID();
      const objectKey = `${org}/photos/${id}.webp`;
      let version: string | undefined;
      try {
        const result = await client.send(
          new PutObjectCommand({
            Bucket: this.bucket,
            Key: objectKey,
            Body: buffer,
            ContentType: 'image/webp',
          }),
        );
        version = result.VersionId;
      } catch {
        throw new ServiceUnavailableException('No se pudo guardar la foto');
      }
      // A failed DB commit can leave an unreferenced private object. Never delete an
      // object on ambiguous commit failures; reconcile unreferenced objects offline.
      const inserted = await manager
        .getRepository(ArchivoEntity)
        .createQueryBuilder()
        .insert()
        .values({
          id,
          organizacion_id: org,
          creado_por: access.userId,
          proveedor: 'minio',
          contenedor: this.bucket,
          ruta_relativa: objectKey,
          version_objeto: version ?? null,
          nombre_original: name,
          mime_detectado: 'image/webp',
          tamano_bytes: String(buffer.length),
          sha256: createHash('sha256').update(buffer).digest('hex'),
          categoria: 'foto_paciente',
          estado_analisis: 'disponible',
        })
        .returning('*')
        .execute();
      const row = (inserted.raw as Row[])[0];
      await manager.query(
        'DELETE FROM api.idempotency WHERE organizacion_id=$1 AND usuario_id=$2 AND key=$3 AND expires_at<=now()',
        [org, access.userId, key],
      );
      await manager.query(
        'INSERT INTO api.idempotency(organizacion_id,usuario_id,key,resource,request_hash,response) VALUES($1,$2,$3,$4,$5,$6)',
        [org, access.userId, key, 'photo-upload', hash, JSON.stringify(row)],
      );
      return { data: row };
    });
  }

  async storeClinical(
    manager: EntityManager,
    access: Access,
    buffer: Buffer,
    name: string,
    mime: string,
    category: string,
  ) {
    const r = resource('archivo');
    for (const action of ['create', 'read'] as const)
      this.access.scopeSql(
        r,
        'r',
        this.access.authorize(access, r, action),
        [],
      );
    const id = randomUUID(),
      objectKey = `${access.organizationId}/clinical/${id}`;
    let version: string | undefined;
    try {
      version = (
        await this.storage().send(
          new PutObjectCommand({
            Bucket: this.bucket,
            Key: objectKey,
            Body: buffer,
            ContentType: mime,
          }),
        )
      ).VersionId;
    } catch {
      throw new ServiceUnavailableException('No se pudo guardar el documento');
    }
    const result = await manager
      .getRepository(ArchivoEntity)
      .createQueryBuilder()
      .insert()
      .values({
        id,
        organizacion_id: access.organizationId,
        creado_por: access.userId,
        proveedor: 'minio',
        contenedor: this.bucket,
        ruta_relativa: objectKey,
        version_objeto: version ?? null,
        nombre_original: name,
        mime_detectado: mime,
        tamano_bytes: String(buffer.length),
        sha256: createHash('sha256').update(buffer).digest('hex'),
        categoria: category,
        estado_analisis: 'disponible',
      })
      .returning('*')
      .execute();
    return (result.raw as Row[])[0];
  }

  async clinicalContent(data: Row, org: string) {
    if (
      data.proveedor !== 'minio' ||
      data.contenedor !== this.bucket ||
      data.estado_analisis !== 'disponible' ||
      !String(data.ruta_relativa).startsWith(`${org}/clinical/`)
    )
      throw new NotFoundException('Documento no disponible');
    try {
      const object = await this.storage().send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: String(data.ruta_relativa),
          ...(typeof data.version_objeto === 'string' && data.version_objeto
            ? { VersionId: String(data.version_objeto) }
            : {}),
        }),
      );
      if (!object.Body || Number(object.ContentLength) > 20 * 1024 * 1024)
        throw new Error('size');
      const buffer = Buffer.from(await object.Body.transformToByteArray());
      if (createHash('sha256').update(buffer).digest('hex') !== data.sha256)
        throw new Error('hash');
      return buffer;
    } catch {
      throw new ServiceUnavailableException(
        'Documento temporalmente no disponible',
      );
    }
  }

  async content(identity: Identity, org: string, id: string) {
    const { data } = await this.persistence.get(
      identity,
      org,
      ArchivoEntity,
      id,
    );
    if (
      data.proveedor !== 'minio' ||
      data.contenedor !== this.bucket ||
      data.estado_analisis !== 'disponible' ||
      data.categoria !== 'foto_paciente' ||
      data.mime_detectado !== 'image/webp' ||
      !String(data.ruta_relativa).startsWith(`${org}/photos/`)
    )
      throw new NotFoundException('Foto no disponible');
    const client = this.storage();
    try {
      const object = await client.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: String(data.ruta_relativa),
          ...(typeof data.version_objeto === 'string' && data.version_objeto
            ? { VersionId: String(data.version_objeto) }
            : {}),
        }),
      );
      if (!object.Body || Number(object.ContentLength) > 10 * 1024 * 1024)
        throw new Error('Invalid object');
      const bytes = Buffer.from(await object.Body.transformToByteArray());
      if (createHash('sha256').update(bytes).digest('hex') !== data.sha256)
        throw new Error('Integrity');
      return bytes;
    } catch {
      throw new ServiceUnavailableException(
        'La foto no está disponible temporalmente',
      );
    }
  }
}
