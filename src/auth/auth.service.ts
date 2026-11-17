import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { PasswordService } from './password.service';
import { Identity, TokenService } from './token.service';
import { CreateAccountDto } from './dto/create-account.dto';

type Credential = {
  usuario_id: string;
  password_hash: string;
  version: number;
  activo?: boolean;
};
type Session = {
  id: string;
  usuario_id: string;
  expires_at: Date;
  revoked_at: Date | null;
  credential_version: number;
};
const digest = (value: string) =>
  createHash('sha256').update(value).digest('hex');
const refreshSecret = () => randomBytes(48).toString('base64url');

@Injectable()
export class AuthService {
  constructor(
    private readonly source: DataSource,
    private readonly passwords: PasswordService,
    private readonly tokens: TokenService,
  ) {}

  private event(
    manager: EntityManager,
    action: string,
    user?: string,
    actor?: string,
  ) {
    return manager.query(
      'INSERT INTO auth.security_event(usuario_id,action,actor_usuario_id) VALUES($1,$2,$3)',
      [user ?? null, action, actor ?? user ?? null],
    );
  }
  private async throttle(kind: string, value: string, max: number) {
    const rows: { attempts: number }[] = await this.source.query(
      `INSERT INTO auth.login_bucket(key,attempts,expires_at) VALUES($1,1,now()+interval '15 minutes')
      ON CONFLICT(key) DO UPDATE SET attempts=CASE WHEN auth.login_bucket.expires_at<=now() THEN 1 ELSE auth.login_bucket.attempts+1 END,
      expires_at=CASE WHEN auth.login_bucket.expires_at<=now() THEN now()+interval '15 minutes' ELSE auth.login_bucket.expires_at END RETURNING attempts`,
      [digest(kind + ':' + value)],
    );
    return rows[0].attempts <= max;
  }
  async login(email: string, password: string, ip: string) {
    email = email.trim().toLowerCase();
    const ipAllowed = await this.throttle('login-ip', ip, 30);
    const accountAllowed =
      ipAllowed && (await this.throttle('login-email', email, 5));
    if (!ipAllowed || !accountAllowed)
      throw new UnauthorizedException(
        'Credenciales invalidas o acceso temporalmente limitado',
      );
    const rows: Credential[] = await this.source.query(
      'SELECT * FROM auth.find_login($1)',
      [email],
    );
    const c = rows[0];
    const valid = await this.passwords.verify(password, c?.password_hash);
    if (!valid || !c?.activo) {
      await this.event(this.source.manager, 'LOGIN_FAILED');
      throw new UnauthorizedException(
        'Credenciales invalidas o acceso temporalmente limitado',
      );
    }
    const result = await this.source.transaction(async (manager) => {
      const [current]: Credential[] = await manager.query(
        'SELECT * FROM auth.credential WHERE usuario_id=$1 FOR UPDATE',
        [c.usuario_id],
      );
      const [active]: { active: boolean }[] = await manager.query(
        'SELECT auth.active_local_user($1) AS active',
        [c.usuario_id],
      );
      if (!active.active || current.password_hash !== c.password_hash)
        throw new UnauthorizedException('Credenciales invalidas');
      const id = randomUUID();
      const [session]: Session[] = await manager.query(
        "INSERT INTO auth.session(id,usuario_id,credential_version,expires_at) VALUES($1,$2,$3,now()+interval '30 days') RETURNING *",
        [id, c.usuario_id, current.version],
      );
      const token = refreshSecret();
      await manager.query(
        'INSERT INTO auth.refresh_token(token_hash,session_id) VALUES($1,$2)',
        [digest(token), id],
      );
      await manager.query('DELETE FROM auth.login_bucket WHERE key=$1', [
        digest('login-email:' + email),
      ]);
      await this.event(manager, 'LOGIN_SUCCESS', c.usuario_id);
      return this.response(c.usuario_id, id, token, session.expires_at);
    });
    return result;
  }
  private async response(
    user: string,
    session: string,
    refreshToken: string,
    expires: Date,
  ) {
    return {
      accessToken: await this.tokens.issue(user, session),
      tokenType: 'Bearer',
      expiresIn: 900,
      refreshToken,
      refreshExpiresAt: expires.toISOString(),
      userId: user,
    };
  }
  async refresh(raw: string, ip: string) {
    if (
      !/^[A-Za-z0-9_-]{64}$/.test(raw) ||
      !(await this.throttle('refresh-ip', ip, 120))
    )
      throw new UnauthorizedException('Renovacion no disponible');
    const hash = digest(raw);
    const result = await this.source.transaction(async (manager) => {
      const found: { session_id: string; usuario_id: string }[] =
        await manager.query(
          'SELECT t.session_id,s.usuario_id FROM auth.refresh_token t JOIN auth.session s ON s.id=t.session_id WHERE t.token_hash=$1',
          [hash],
        );
      if (!found[0]) return null;
      // Orden de bloqueos común con login, cambio y recuperación de contraseña.
      const [c]: Credential[] = await manager.query(
        'SELECT * FROM auth.credential WHERE usuario_id=$1 FOR UPDATE',
        [found[0].usuario_id],
      );
      const [s]: Session[] = await manager.query(
        'SELECT * FROM auth.session WHERE id=$1 FOR UPDATE',
        [found[0].session_id],
      );
      const [t]: { consumed_at: Date | null }[] = await manager.query(
        'SELECT consumed_at FROM auth.refresh_token WHERE token_hash=$1',
        [hash],
      );
      if (t.consumed_at) {
        await manager.query(
          'UPDATE auth.session SET revoked_at=coalesce(revoked_at,now()) WHERE id=$1',
          [s.id],
        );
        await this.event(manager, 'REFRESH_REUSE', s.usuario_id);
        return null; // El COMMIT conserva la revocación antes del 401.
      }
      const [active]: { active: boolean }[] = await manager.query(
        'SELECT auth.active_local_user($1) AS active',
        [s.usuario_id],
      );
      if (
        !active.active ||
        s.revoked_at ||
        s.expires_at.getTime() <= Date.now() ||
        s.credential_version !== c.version
      )
        return null;
      await manager.query(
        'UPDATE auth.refresh_token SET consumed_at=now() WHERE token_hash=$1',
        [hash],
      );
      const next = refreshSecret();
      await manager.query(
        'INSERT INTO auth.refresh_token(token_hash,session_id) VALUES($1,$2)',
        [digest(next), s.id],
      );
      return this.response(s.usuario_id, s.id, next, s.expires_at);
    });
    if (!result) throw new UnauthorizedException('Renovacion no disponible');
    return result;
  }
  async logout(identity: Identity, all = false) {
    await this.source.transaction(async (manager) => {
      await manager.query(
        'SELECT usuario_id FROM auth.credential WHERE usuario_id=$1 FOR UPDATE',
        [identity.subject],
      );
      await manager.query(
        `UPDATE auth.session SET revoked_at=coalesce(revoked_at,now()) WHERE usuario_id=$1${all ? '' : ' AND id=$2'}`,
        all ? [identity.subject] : [identity.subject, identity.sessionId],
      );
      await this.event(
        manager,
        all ? 'LOGOUT_ALL' : 'LOGOUT',
        identity.subject,
      );
    });
  }
  async changePassword(
    identity: Identity,
    currentPassword: string,
    newPassword: string,
  ) {
    const c = await this.confirmPassword(identity, currentPassword);
    this.passwords.assertPolicy(newPassword);
    if (await this.passwords.verify(newPassword, c.password_hash))
      throw new BadRequestException('La nueva contrasena debe ser distinta');
    const hash = await this.passwords.hash(newPassword);
    await this.source.transaction(async (manager) => {
      const [fresh]: Credential[] = await manager.query(
        'SELECT * FROM auth.credential WHERE usuario_id=$1 FOR UPDATE',
        [identity.subject],
      );
      if (fresh.password_hash !== c.password_hash)
        throw new ConflictException(
          'Las credenciales cambiaron; inicie sesion de nuevo',
        );
      await this.replacePassword(manager, identity.subject, hash);
      await this.event(manager, 'PASSWORD_CHANGED', identity.subject);
    });
  }
  private async confirmPassword(identity: Identity, password: string) {
    if (!(await this.throttle('confirm-user', identity.subject, 5)))
      throw new UnauthorizedException('Verificacion temporalmente limitada');
    const [c]: Credential[] = await this.source.query(
      'SELECT * FROM auth.credential WHERE usuario_id=$1',
      [identity.subject],
    );
    if (!c || !(await this.passwords.verify(password, c.password_hash)))
      throw new UnauthorizedException('Contrasena actual incorrecta');
    return c;
  }
  private async replacePassword(
    manager: EntityManager,
    user: string,
    hash: string,
  ) {
    await manager.query(
      'UPDATE auth.credential SET password_hash=$2,version=version+1,changed_at=now() WHERE usuario_id=$1',
      [user, hash],
    );
    await manager.query(
      'UPDATE auth.session SET revoked_at=coalesce(revoked_at,now()) WHERE usuario_id=$1',
      [user],
    );
    await manager.query(
      'UPDATE auth.password_reset SET used_at=coalesce(used_at,now()) WHERE usuario_id=$1',
      [user],
    );
  }
  async createAccount(identity: Identity, dto: CreateAccountDto) {
    if (!identity.platformAdmin)
      throw new ForbiddenException('Se requiere operador de plataforma');
    const email = dto.email.trim().toLowerCase();
    this.passwords.assertPolicy(dto.password, email);
    const hash = await this.passwords.hash(dto.password);
    return this.source.transaction(async (manager) => {
      await manager.query(
        "SELECT set_config('app.platform_admin','true',true),set_config('app.usuario_id',$1,true),set_config('app.organizacion_id',$2,true)",
        [identity.subject, dto.organizacion_id],
      );
      const org: object[] = await manager.query(
        "SELECT id FROM vet.organizacion WHERE id=$1 AND estado='activa'",
        [dto.organizacion_id],
      );
      if (!org.length)
        throw new NotFoundException('Organizacion no disponible');
      if (dto.rol_id) {
        const role: object[] = await manager.query(
          'SELECT id FROM vet.rol WHERE organizacion_id=$1 AND id=$2',
          [dto.organizacion_id, dto.rol_id],
        );
        if (!role.length) throw new NotFoundException('Rol no disponible');
      }
      const id = randomUUID();
      await manager.query(
        "INSERT INTO vet.usuario(id,proveedor_identidad,identificador_externo,nombre,email) VALUES($1::uuid,'local',$1::uuid::text,$2,$3)",
        [id, dto.nombre, email],
      );
      await manager.query(
        'INSERT INTO auth.credential(usuario_id,password_hash) VALUES($1,$2)',
        [id, hash],
      );
      const [member]: { id: string }[] = await manager.query(
        'INSERT INTO vet.membresia(organizacion_id,usuario_id) VALUES($1,$2) RETURNING id',
        [dto.organizacion_id, id],
      );
      if (dto.rol_id)
        await manager.query(
          'INSERT INTO vet.asignacion_rol(organizacion_id,membresia_id,rol_id) VALUES($1,$2,$3)',
          [dto.organizacion_id, member.id, dto.rol_id],
        );
      await this.event(manager, 'ACCOUNT_CREATED', id, identity.subject);
      await manager.query('SELECT vet.record_api_access($1,$2,$3)', [
        'usuario',
        id,
        'INSERT_GLOBAL',
      ]);
      return {
        id,
        email,
        nombre: dto.nombre,
        organizacion_id: dto.organizacion_id,
        membresia_id: member.id,
      };
    });
  }
  async issueReset(identity: Identity, user: string, password: string) {
    if (!identity.platformAdmin)
      throw new ForbiddenException('Se requiere operador de plataforma');
    await this.confirmPassword(identity, password);
    return this.source.transaction(async (manager) => {
      const rows: Credential[] = await manager.query(
        'SELECT * FROM auth.credential WHERE usuario_id=$1 FOR UPDATE',
        [user],
      );
      if (!rows.length) throw new NotFoundException('Cuenta no disponible');
      await manager.query(
        'UPDATE auth.password_reset SET used_at=now() WHERE usuario_id=$1 AND used_at IS NULL',
        [user],
      );
      const token = refreshSecret();
      await manager.query(
        "INSERT INTO auth.password_reset(token_hash,usuario_id,expires_at) VALUES($1,$2,now()+interval '15 minutes')",
        [digest(token), user],
      );
      await this.event(manager, 'RESET_ISSUED', user, identity.subject);
      return { token, expiresIn: 900 };
    });
  }
  async resetPassword(raw: string, password: string, ip: string) {
    if (!(await this.throttle('reset-ip', ip, 15)))
      throw new UnauthorizedException('Recuperacion no disponible');
    this.passwords.assertPolicy(password);
    const rows: { usuario_id: string }[] = await this.source.query(
      'SELECT usuario_id FROM auth.password_reset WHERE token_hash=$1 AND used_at IS NULL AND expires_at>now()',
      [digest(raw)],
    );
    if (!rows[0]) throw new UnauthorizedException('Recuperacion no disponible');
    const hash = await this.passwords.hash(password);
    await this.source.transaction(async (manager) => {
      await manager.query(
        'SELECT usuario_id FROM auth.credential WHERE usuario_id=$1 FOR UPDATE',
        [rows[0].usuario_id],
      );
      const valid: object[] = await manager.query(
        'SELECT token_hash FROM auth.password_reset WHERE token_hash=$1 AND used_at IS NULL AND expires_at>now() FOR UPDATE',
        [digest(raw)],
      );
      if (!valid.length)
        throw new UnauthorizedException('Recuperacion no disponible');
      await this.replacePassword(manager, rows[0].usuario_id, hash);
      await this.event(manager, 'PASSWORD_RESET', rows[0].usuario_id);
    });
  }
  async me(identity: Identity) {
    return this.source.transaction(async (manager) => {
      await manager.query(
        "SELECT set_config('app.usuario_id',$1,true),set_config('app.platform_admin',$2,true)",
        [identity.subject, identity.platformAdmin ? 'true' : 'false'],
      );
      const [user]: { id: string; nombre: string; email: string }[] =
        await manager.query(
          'SELECT id,nombre,email FROM vet.usuario WHERE id=$1',
          [identity.subject],
        );
      // El operador ya tiene alcance global; no necesita membresías artificiales.
      // La identidad proviene de la sesión verificada, nunca de parámetros del cliente.
      const organizations: object[] = await manager.query(
        identity.platformAdmin
          ? "SELECT id,nombre FROM vet.organizacion WHERE estado='activa' ORDER BY nombre,id"
          : 'SELECT * FROM auth.my_organizations()',
      );
      return { ...user, platformAdmin: identity.platformAdmin, organizations };
    });
  }
}
