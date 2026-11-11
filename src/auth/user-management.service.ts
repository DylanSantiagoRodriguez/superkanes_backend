import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource, EntityManager } from 'typeorm';
import { createHmac, randomUUID } from 'node:crypto';
import type { Identity } from './token.service';
import { PasswordService } from './password.service';
import { permissionCodes, resources } from '../resources/resource-registry';
import {
  CreateManagedUserDto,
  LinkOrganizationsDto,
  OrganizationAccessDto,
  OrganizationOptionsDto,
  UserSearchDto,
} from './dto/manage-users.dto';

type User = {
  id: string;
  nombre: string;
  email: string;
  activo: boolean;
  has_login: boolean;
};
type Member = { id: string; activo: boolean };
@Injectable()
export class UserManagementService {
  constructor(
    private readonly source: DataSource,
    private readonly passwords: PasswordService,
    private readonly config: ConfigService,
  ) {}
  private authorize(identity: Identity) {
    if (!identity.platformAdmin)
      throw new ForbiddenException('Se requiere operador de plataforma');
  }
  private context(manager: EntityManager, identity: Identity, org = '') {
    return manager.query(
      "SELECT set_config('app.platform_admin','true',true),set_config('app.usuario_id',$1,true),set_config('app.organizacion_id',$2,true),set_config('app.request_id',$3,true)",
      [identity.subject, org, randomUUID()],
    );
  }
  private async user(manager: EntityManager, id: string) {
    const [user]: User[] = await manager.query(
      'SELECT u.id,u.nombre,u.email,u.activo,EXISTS(SELECT 1 FROM auth.credential c WHERE c.usuario_id=u.id) AS has_login FROM vet.usuario u WHERE u.id=$1 FOR UPDATE OF u',
      [id],
    );
    if (!user) throw new NotFoundException('Usuario no disponible');
    return user;
  }
  users(identity: Identity, query: UserSearchDto) {
    this.authorize(identity);
    return this.source.transaction(async (manager) => {
      await this.context(manager, identity);
      const search =
        '%' + (query.search ?? '').trim().replace(/[\\%_]/g, '\\$&') + '%';
      const rows: User[] = await manager.query(
        'SELECT u.id,u.nombre,u.email,u.activo,EXISTS(SELECT 1 FROM auth.credential c WHERE c.usuario_id=u.id) AS has_login FROM vet.usuario u WHERE (u.nombre ILIKE $1 OR u.email ILIKE $1) AND ($2::uuid IS NULL OR u.id>$2::uuid) ORDER BY u.id LIMIT 26',
        [search, query.after ?? null],
      );
      await manager.query(
        "INSERT INTO auth.security_event(actor_usuario_id,action) VALUES($1,'USERS_LISTED')",
        [identity.subject],
      );
      return {
        data: rows.slice(0, 25),
        page: { next: rows.length > 25 ? rows[24].id : null },
      };
    });
  }
  organizations(identity: Identity, query: OrganizationOptionsDto) {
    this.authorize(identity);
    return this.source.transaction(async (manager) => {
      await this.context(manager, identity);
      if (query.usuario_id) await this.user(manager, query.usuario_id);
      const orgs: { id: string; nombre: string }[] = await manager.query(
        "SELECT id,nombre FROM vet.organizacion WHERE estado='activa' AND ($1::uuid IS NULL OR id>$1::uuid) ORDER BY id LIMIT 26",
        [query.after ?? null],
      );
      const data: object[] = [];
      for (const org of orgs.slice(0, 25)) {
        await manager.query(
          "SELECT set_config('app.organizacion_id',$1,true)",
          [org.id],
        );
        const roles: { id: string; nombre: string }[] = await manager.query(
          'SELECT id,nombre FROM vet.rol WHERE organizacion_id=$1 ORDER BY nombre',
          [org.id],
        );
        const [member]: Member[] = query.usuario_id
          ? await manager.query(
              'SELECT id,activo FROM vet.membresia WHERE organizacion_id=$1 AND usuario_id=$2',
              [org.id, query.usuario_id],
            )
          : [];
        const assignments = member
          ? await manager.query<object[]>(
              'SELECT a.rol_id,r.nombre,a.sede_id FROM vet.asignacion_rol a JOIN vet.rol r ON r.organizacion_id=a.organizacion_id AND r.id=a.rol_id WHERE a.organizacion_id=$1 AND a.membresia_id=$2',
              [org.id, member.id],
            )
          : [];
        data.push({
          ...org,
          roles,
          membership: member ? { ...member, roles: assignments } : null,
        });
        await manager.query(
          "SELECT vet.record_api_access('membresia',$1,'LIST')",
          [query.usuario_id ?? identity.subject],
        );
      }
      return { data, page: { next: orgs.length > 25 ? orgs[24].id : null } };
    });
  }
  private async grant(
    manager: EntityManager,
    identity: Identity,
    user: string,
    input: OrganizationAccessDto,
  ) {
    await manager.query("SELECT set_config('app.organizacion_id',$1,true)", [
      input.organizacion_id,
    ]);
    // Serialize membership/role changes per organization, including first-role creation.
    await manager.query(
      'SELECT pg_advisory_xact_lock(hashtextextended($1,0))',
      ['user-management-org:' + input.organizacion_id],
    );
    const [org]: { id: string }[] = await manager.query(
      "SELECT id FROM vet.organizacion WHERE id=$1 AND estado='activa' FOR SHARE",
      [input.organizacion_id],
    );
    if (!org) throw new NotFoundException('Organización no disponible');
    let role = input.rol_id;
    if (input.crear_rol_administrador) {
      const existing: object[] = await manager.query(
        'SELECT id FROM vet.rol WHERE organizacion_id=$1 LIMIT 1',
        [org.id],
      );
      if (existing.length)
        throw new ConflictException({
          code: 'ROLE_ALREADY_CONFIGURED',
          message: 'La organización ya tiene roles; seleccione uno existente',
        });
      const [created]: { id: string }[] = await manager.query(
        "INSERT INTO vet.rol(organizacion_id,nombre,descripcion) VALUES($1,'Administrador de organización','Administración de los recursos de esta organización; sin privilegios de plataforma') RETURNING id",
        [org.id],
      );
      role = created.id;
      const codes = permissionCodes().filter((code) => {
        const [name, action] = code.split('.');
        return !resources.get(name)?.platformWrite || action === 'read';
      });
      await manager.query(
        'INSERT INTO vet.rol_permiso(organizacion_id,rol_id,permiso_id) SELECT $1,$2,id FROM vet.permiso WHERE codigo=ANY($3::text[])',
        [org.id, role, codes],
      );
    } else {
      const found: object[] = await manager.query(
        'SELECT id FROM vet.rol WHERE organizacion_id=$1 AND id=$2 FOR SHARE',
        [org.id, role],
      );
      if (!found.length)
        throw new BadRequestException({
          code: 'ROLE_ORGANIZATION_MISMATCH',
          message: 'El rol no pertenece a la organización seleccionada',
        });
    }
    let [member]: Member[] = await manager.query(
      'SELECT id,activo FROM vet.membresia WHERE organizacion_id=$1 AND usuario_id=$2 FOR UPDATE',
      [org.id, user],
    );
    if (member && !member.activo)
      throw new ConflictException({
        code: 'MEMBERSHIP_INACTIVE',
        message:
          'La membresía está inactiva; debe reactivarse desde configuración',
      });
    if (!member) {
      [member] = await manager.query<Member[]>(
        'INSERT INTO vet.membresia(organizacion_id,usuario_id) VALUES($1,$2) RETURNING id,activo',
        [org.id, user],
      );
    }
    // Linking adds only the requested grant and preserves other organizations and roles.
    await manager.query(
      'INSERT INTO vet.asignacion_rol(organizacion_id,membresia_id,rol_id) SELECT $1,$2,$3 WHERE NOT EXISTS(SELECT 1 FROM vet.asignacion_rol WHERE organizacion_id=$1 AND membresia_id=$2 AND rol_id=$3 AND sede_id IS NULL)',
      [org.id, member.id, role],
    );
    await manager.query(
      "INSERT INTO auth.security_event(usuario_id,action,actor_usuario_id) VALUES($1,'ORGANIZATION_ACCESS_LINKED',$2)",
      [user, identity.subject],
    );
    return { organizacion_id: org.id, membresia_id: member.id, rol_id: role };
  }
  async save(
    identity: Identity,
    body: LinkOrganizationsDto | CreateManagedUserDto,
    key: string,
    userId?: string,
  ) {
    this.authorize(identity);
    const entries = [...body.organizaciones].sort((a, b) =>
      a.organizacion_id.localeCompare(b.organizacion_id),
    );
    if (new Set(entries.map((e) => e.organizacion_id)).size !== entries.length)
      throw new BadRequestException('No repita organizaciones');
    for (const entry of entries)
      if (Boolean(entry.rol_id) === Boolean(entry.crear_rol_administrador))
        throw new BadRequestException(
          'Seleccione un rol o cree el primer rol de administrador',
        );
    const create = userId ? undefined : (body as CreateManagedUserDto);
    const email = create?.email.trim().toLowerCase();
    if (create) {
      if (!create.nombre.trim())
        throw new BadRequestException('Nombre obligatorio');
      this.passwords.assertPolicy(create.password, email);
    }
    const resource = userId ? 'admin-link-user:' + userId : 'admin-create-user';
    // A keyed digest avoids retaining the password or a guessable password hash in replay metadata.
    const hash = createHmac(
      'sha256',
      this.config.getOrThrow<string>('AUTH_JWT_SECRET'),
    )
      .update(
        JSON.stringify({
          resource,
          email,
          nombre: create?.nombre.trim(),
          password: create?.password,
          entries: entries.map((e) => [
            e.organizacion_id,
            e.rol_id ?? null,
            !!e.crear_rol_administrador,
          ]),
        }),
      )
      .digest('hex');
    return this.source.transaction(async (manager) => {
      const first = entries[0].organizacion_id;
      await this.context(manager, identity, first);
      await manager.query(
        'SELECT pg_advisory_xact_lock(hashtextextended($1,0))',
        [identity.subject + ':' + key],
      );
      const [replay]: {
        request_hash: string;
        resource: string;
        response: object;
      }[] = await manager.query(
        'SELECT request_hash,resource,response FROM api.idempotency WHERE organizacion_id=$1 AND usuario_id=$2 AND key=$3 AND expires_at>now()',
        [first, identity.subject, key],
      );
      if (replay) {
        if (replay.request_hash !== hash || replay.resource !== resource)
          throw new ConflictException(
            'La clave de reintento corresponde a otra solicitud',
          );
        return replay.response;
      }
      let user: User;
      if (create) {
        await manager.query(
          'SELECT pg_advisory_xact_lock(hashtextextended($1,0))',
          ['user-management-email:' + email],
        );
        const existing: object[] = await manager.query(
          'SELECT id FROM vet.usuario WHERE lower(email)=$1 LIMIT 1',
          [email],
        );
        if (existing.length)
          throw new ConflictException({
            code: 'USER_EMAIL_EXISTS',
            message: 'El correo ya existe; use Vincular usuario existente',
          });
        const id = randomUUID();
        await manager.query(
          "INSERT INTO vet.usuario(id,proveedor_identidad,identificador_externo,nombre,email) VALUES($1::uuid,'local',$1::uuid::text,$2,$3)",
          [id, create.nombre.trim(), email],
        );
        await manager.query(
          'INSERT INTO auth.credential(usuario_id,password_hash) VALUES($1,$2)',
          [id, await this.passwords.hash(create.password)],
        );
        await manager.query(
          "SELECT vet.record_api_access('usuario',$1,'INSERT_GLOBAL')",
          [id],
        );
        await manager.query(
          "INSERT INTO auth.security_event(usuario_id,action,actor_usuario_id) VALUES($1,'ACCOUNT_CREATED',$2)",
          [id, identity.subject],
        );
        user = {
          id,
          nombre: create.nombre.trim(),
          email: email!,
          activo: true,
          has_login: true,
        };
      } else {
        user = await this.user(manager, userId!);
        if (!user.activo || !user.has_login)
          throw new ConflictException({
            code: 'USER_NOT_ENABLED',
            message: 'El usuario no tiene una cuenta activa con acceso local',
          });
      }
      const memberships: object[] = [];
      for (const entry of entries)
        memberships.push(await this.grant(manager, identity, user.id, entry));
      const response = { data: { user, memberships } };
      await manager.query("SELECT set_config('app.organizacion_id',$1,true)", [
        first,
      ]);
      await manager.query(
        'DELETE FROM api.idempotency WHERE organizacion_id=$1 AND usuario_id=$2 AND key=$3 AND expires_at<=now()',
        [first, identity.subject, key],
      );
      await manager.query(
        'INSERT INTO api.idempotency(organizacion_id,usuario_id,key,resource,request_hash,response) VALUES($1,$2,$3,$4,$5,$6)',
        [
          first,
          identity.subject,
          key,
          resource,
          hash,
          JSON.stringify(response),
        ],
      );
      return response;
    });
  }
}
