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
    entitySourcePath?: string;
}

export interface TenantInfo {
    /** The path as to where to set the tenantId on the entity */
    entityPathToId: string;
    /** The path to the source for the tenantId on the ExecutionContext */
    executionContextSourcePath: string;
    /** The display name as a user would see it for what the tenant is e.g. Team or Organisation */
    title: string;
    /** The schema used to validate the tenantId */
    schema: JsonSchema;
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
