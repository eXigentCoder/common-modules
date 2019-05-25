export { Validator } from '../validation/ajv';
export interface JsonSchema {
    $id?: string;
    //todo rk needs to use title instead but requires a rework
    name?: string;
    title?: string;
    description?: string;
    default?: any;
    examples?: any;
    $comment?: string;
    type?: string | string[];
    additionalProperties?: boolean;
    properties?: { [key: string]: JsonSchema };
    allOf?: JsonSchema[];
    anyOf?: JsonSchema[];
    oneOf?: JsonSchema[];
    not?: JsonSchema;
    enum?: Array[any];
    const?: any;
    required?: string[];
    errorMessage?: Object;
    definitions?: { [key: string]: JsonSchema };
    $ref?: string;
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
    source?: string;
}

export interface EntityMetadata {
    schemas: { [key: string]: JsonSchema } & MainSchemas;
    name: string;
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
}
