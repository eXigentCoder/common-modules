/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

import { JsonSchema } from './types';

export interface EntityMetadata {
    schemas: {
        core: JsonSchema;
        create?: JsonSchema;
        output?: JsonSchema;
        replace?: JsonSchema;
        [k: string]: any;
    };
    identifier: Identifier;
    stringIdentifier?: StringIdentifier;
    tenantInfo?: TenantInfo;
    authorization?: Authorization;
    statuses?: Statuses;
    /**
     * A human readable string identifier used to refer to an entitiy
     */
    collectionName: string;
    /**
     * A human readable string identifier used to refer to an entitiy
     */
    auditCollectionName?: string;
    auditChanges?: boolean;
    baseUrl: string;
    aOrAn?: 'An' | 'A';
    /**
     * A human readable string identifier used to refer to an entitiy
     */
    name?: string;
    /**
     * A human readable string identifier used to refer to an entitiy
     */
    namePlural?: string;
    title?: string;
    titlePlural?: string;
}
export interface Identifier {
    pathToId: string;
    schema: {
        [k: string]: any;
    };
}
export interface StringIdentifier {
    pathToId: string;
    schema: {
        [k: string]: any;
    };
    entitySourcePath?: string;
}
export interface TenantInfo {
    entityPathToId: string;
    executionContextSourcePath: string;
    title: string;
    schema: {
        [k: string]: any;
    };
}
export interface Authorization {
    policies?: string[][];
    groups?: string[][];
    ownership?: Ownership;
    interaction: 'or' | 'and';
}
export interface Ownership {
    initialOwner: 'creator' | 'setFromEntity' | 'setFromContext';
    pathToId?: string;
    allowedActions: string[];
    idSchema?: JsonSchema;
}
export interface Statuses {}
