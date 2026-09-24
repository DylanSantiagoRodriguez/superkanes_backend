import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { randomUUID } from 'node:crypto';
import { isUUID } from 'class-validator';

export interface Identity {
  issuer: string;
  subject: string;
  platformAdmin: boolean;
  sessionId: string;
}
@Injectable()
export class TokenService {
  private readonly key: Uint8Array;
  constructor(
    private readonly config: ConfigService,
    private readonly source: DataSource,
  ) {
    this.key = Buffer.from(
      config.getOrThrow<string>('AUTH_JWT_SECRET'),
      'base64',
    );
  }
  async issue(userId: string, sessionId: string) {
    const { SignJWT } = await import('jose');
    return new SignJWT({ sid: sessionId })
      .setProtectedHeader({ alg: 'HS256', typ: 'at+jwt' })
      .setSubject(userId)
      .setIssuer(this.config.getOrThrow<string>('AUTH_ISSUER'))
      .setAudience(this.config.getOrThrow<string>('AUTH_AUDIENCE'))
      .setIssuedAt()
      .setJti(randomUUID())
      .setExpirationTime('15m')
      .sign(this.key);
  }
  async verify(token: string): Promise<Identity> {
    let userId: string, sessionId: string;
    try {
      const { jwtVerify } = await import('jose');
      const { payload } = await jwtVerify(token, this.key, {
        issuer: this.config.getOrThrow<string>('AUTH_ISSUER'),
        audience: this.config.getOrThrow<string>('AUTH_AUDIENCE'),
        algorithms: ['HS256'],
        typ: 'at+jwt',
        requiredClaims: ['sub', 'sid', 'jti', 'iat', 'exp'],
        maxTokenAge: '15m',
        clockTolerance: 5,
      });
      if (
        !payload.sub ||
        !isUUID(payload.sub) ||
        typeof payload.sid !== 'string' ||
        !isUUID(payload.sid)
      )
        throw new Error('Invalid claims');
      userId = payload.sub;
      sessionId = payload.sid;
    } catch {
      throw new UnauthorizedException('Token invalido o expirado');
    }
    const rows: { usuario_id: string; platform_admin: boolean }[] =
      await this.source.query('SELECT * FROM auth.resolve_session($1,$2)', [
        sessionId,
        userId,
      ]);
    if (!rows[0]) throw new UnauthorizedException('Sesion no disponible');
    return {
      issuer: 'local',
      subject: userId,
      sessionId,
      platformAdmin: rows[0].platform_admin,
    };
  }
}
