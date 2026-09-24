import { DataSource, EntityManager } from 'typeorm';
import { DatabaseService } from './database.service';

describe('TypeORM tenant transaction boundary', () => {
  const context = {
    organizationId: '11111111-1111-4111-8111-111111111111',
    userId: '22222222-2222-4222-8222-222222222222',
    requestId: '33333333-3333-4333-8333-333333333333',
  };
  const query = jest.fn();
  const transaction = jest.fn();
  const manager = { query } as unknown as EntityManager;
  let service: DatabaseService;

  beforeEach(() => {
    jest.clearAllMocks();
    query.mockResolvedValue([]);
    transaction.mockImplementation(
      (operation: (m: EntityManager) => Promise<unknown>) => operation(manager),
    );
    service = new DatabaseService({ transaction } as unknown as DataSource);
  });

  it('establece contexto local antes de usar el manager transaccional', async () => {
    const operation = jest.fn().mockResolvedValue('done');
    await expect(service.withTenant(context, operation)).resolves.toBe('done');
    expect(transaction).toHaveBeenCalledTimes(1);
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining("set_config('app.organizacion_id', $1, true)"),
      Object.values(context),
    );
    expect(operation).toHaveBeenCalledWith(manager);
  });

  it('propaga errores a TypeORM para revertir la transaccion', async () => {
    await expect(
      service.withTenant(context, () => Promise.reject(new Error('conflict'))),
    ).rejects.toThrow('conflict');
  });

  it('rechaza contexto invalido antes de abrir transaccion', async () => {
    await expect(
      service.withTenant({ ...context, organizationId: 'bad' }, () =>
        Promise.resolve(),
      ),
    ).rejects.toThrow();
    expect(transaction).not.toHaveBeenCalled();
  });
});
