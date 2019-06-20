import { JSONSchema7 } from 'json-schema';
export { Validator } from '../validation/ajv';
export * from './entity-metadata';

export interface JsonSchema extends JSONSchema7 {
    mongoId?: boolean;
    faker?: any;
    chance?: any;
    coerceFromFormat?: boolean;
    errorMessage?: any;
}
