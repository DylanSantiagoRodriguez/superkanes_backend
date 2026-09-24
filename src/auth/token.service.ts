import {
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { createRemoteJWKSet } from 'jose';

export interface Identity {
  issuer: string;
  subject: string;
  platformAdmin: boolean;
}
@Injectable()
export class TokenService {
  private keys?: ReturnType<typeof createRemoteJWKSet>;
  private readonly admins: Set<string>;
  constructor(private readonly config: ConfigService) {
    this.admins = new Set(
      (config.get<string>('AUTH_PLATFORM_SUBJECTS') ?? '')
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean),
    );
  }
  async verify(token: string): Promise<Identity> {
    const uri = this.config.get<string>('AUTH_JWKS_URI');
    if (!uri)
      throw new ServiceUnavailableException(
        'Autenticacion pendiente de configurar',
      );
    try {
      const { createRemoteJWKSet, jwtVerify } = await import('jose');
      this.keys ??= createRemoteJWKSet(new URL(uri), {
        timeoutDuration: 5000,
        cooldownDuration: 30000,
        cacheMaxAge: 600000,
      });
      const { payload } = await jwtVerify(token, this.keys, {
        issuer: this.config.getOrThrow<string>('AUTH_ISSUER'),
        audience: this.config.getOrThrow<string>('AUTH_AUDIENCE'),
        algorithms: ['RS256', 'ES256'],
        requiredClaims: ['sub', 'exp', 'iat'],
        clockTolerance: 5,
      });
      if (!payload.sub || !payload.iss) throw new Error('Missing identity');
      return {
        issuer: payload.iss,
        subject: payload.sub,
        platformAdmin: this.admins.has(payload.sub),
      };
    } catch {
      throw new UnauthorizedException('Token invalido o expirado');
    }
  }
}
