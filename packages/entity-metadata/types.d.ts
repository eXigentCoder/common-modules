import { JSONSchema7 } from 'json-schema';
export { Validator } from '../validation/ajv';
export * from './entity-metadata';

export type MongoDbObjectIdCoercion = 'string' | 'object';

export interface JsonSchema extends JSONSchema7, JSONSchema7Definition {
    mongoDbObjectIdCoercion?: MongoDbObjectIdCoercion;
    faker?: any;
    chance?: any;
    coerceFromFormat?: boolean;
    errorMessage?: any;
}
