import { registerDecorator, ValidationOptions } from 'class-validator';
import type { Column } from '../../resources/resource-registry';
import { field } from '../../resources/resource-validation';

/** Reuses the exact SQL type constraints for HTTP DTO validation. */
export function DatabaseValue(
  column: Column,
  options?: ValidationOptions,
): PropertyDecorator {
  return (target, propertyKey) =>
    registerDecorator({
      name: 'databaseValue',
      target: target.constructor,
      propertyName: String(propertyKey),
      options,
      validator: {
        validate(value: unknown) {
          try {
            field(column, value);
            return true;
          } catch {
            return false;
          }
        },
        defaultMessage() {
          return `${column.name}: valor invalido`;
        },
      },
    });
}
