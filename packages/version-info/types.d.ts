import { EntityMetadata, Validator } from '../entity-metadata';
import { JsonSchema } from '../entity-metadata/types';

export interface Identity {
    id: string;
    [key: string]: any;
}

export interface VersionInfo {
    dateCreated: Date;
    versionTag: string;
    dateUpdated: Date;
    createdBy: Identity;
    lastUpdatedBy: Identity;
    updatedByRequestId: string;
}

export interface ExecutionContext {
    requestId: string;
    identity: Identity;
    codeVersion: string;
    sourceIp?: string;
    source?: string;
}

export interface VersionedObject {
    versionInfo: VersionInfo;
    [key: string]: any;
}

export type SetVersionInfo = (object: any, context: ExecutionContext) => VersionedObject;

export interface CreateVersionInfoSetterOptions {
    metadata: EntityMetadata;
    validator: Validator;
    executionContextSchema?: JsonSchema;
}
