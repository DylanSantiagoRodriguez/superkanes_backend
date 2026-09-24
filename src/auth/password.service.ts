import {
  BadRequestException,
  Injectable,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { randomBytes } from 'node:crypto';

@Injectable()
export class PasswordService implements OnModuleInit {
  private dummy = '';
  private running = 0;
  private readonly options = {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 1,
  } as const;
  async onModuleInit() {
    this.dummy = await this.hash(randomBytes(32).toString('hex'));
  }
  assertPolicy(password: string, email?: string) {
    const length = [...password].length;
    if (
      length < 15 ||
      length > 128 ||
      Buffer.byteLength(password, 'utf8') > 512 ||
      password.includes('\0')
    )
      throw new BadRequestException(
        'Use una contrasena de 15 a 128 caracteres',
      );
    const lower = password.toLowerCase();
    const common = new Set([
      'passwordpassword',
      'password123456789',
      '123456789012345',
      '1234567890123456',
      'qwertyuiopasdfgh',
      'contrasenacontrasena',
    ]);
    if (
      common.has(lower) ||
      new Set(password).size < 4 ||
      (email && lower.includes(email.toLowerCase()))
    )
      throw new BadRequestException('La contrasena es demasiado predecible');
  }
  async hash(password: string) {
    return this.bounded(() => argon2.hash(password, this.options));
  }
  async verify(password: string, hash?: string) {
    return this.bounded(async () => {
      try {
        return await argon2.verify(hash ?? this.dummy, password);
      } catch {
        return false;
      }
    });
  }
  private async bounded<T>(work: () => Promise<T>): Promise<T> {
    if (this.running >= 4)
      throw new ServiceUnavailableException('Autenticacion ocupada; reintente');
    this.running++;
    try {
      return await work();
    } finally {
      this.running--;
    }
  }
}
