import { JSONSchema7 } from '@types/json-schema';
export { Validator } from '../validation/ajv';

export interface JsonSchema extends JSONSchema7 {
    //todo rk needs to use title instead but requires a rework of code
    name?: string;
    mongoId?: boolean;
    faker?: any;
    chance?: any;
    firebaseTimestamp?: boolean;
}

interface MainSchemas {
    core: JsonSchema;
    output?: JsonSchema;
    create?: JsonSchema;
    replace?: JsonSchema;
}

export interface Identifier {
    name: string;
    schema: JsonSchema;
}

export interface StringIdentifier {
    name: string;
    schema: JsonSchema;
    entitySourceLocation?: string;
}

export interface TenantInfo {
    entityDestinationLocation: string;
    executionContextSource: string;
}

export interface EntityMetadata {
    schemas: { [key: string]: JsonSchema } & MainSchemas;
    name?: string;
    namePlural?: string;
    title?: string;
    titlePlural?: string;
    aOrAn?: string;
    identifier: Identifier;
    stringIdentifier?: StringIdentifier;
    collectionName: string;
    auditCollectionName?: string;
    auditChanges?: boolean;
    baseUrl: string;
    titleToStringIdentifier?: (title: string) => string;
    tenantInfo?: TenantInfo;
}
