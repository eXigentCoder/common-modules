import { Db } from 'mongodb';
import { Validator } from '../validation/ajv';
import { ExecutionContext } from '../version-info/create-version-info-setter';

/** Default options used to paginate search queries */
export interface PaginationDefaults {
    /** The number of items to include in a page when no overriding value is provided */
    itemsPerPage: number;
    /** A mongodb projection to apply to the items */
    projection: Object;
    /** A mongodb sort query to apply to the items */
    sort: Object;
}

export interface CreateUtilityParams {
    metadata: EntityMetadata;
    inputValidator: Validator;
    outputValidator: Validator;
    db: Db;
    auditors?: Auditors;
    paginationDefaults?: PaginationDefaults;
}

export interface Utilities {
    setVersionInfo: SetVersionInfo;
    db: Db;
    collection: Collection;
    mapOutput: MapOutput;
    metadata: EntityMetadata;
    setStringIdentifier: SetStringIdentifier;
    getIdentifierQuery: GetIdentifierQuery;
    inputValidator: Validator;
    outputValidator: Validator;
    auditors: Auditors;
    paginationDefaults: PaginationDefaults;
}

export interface Crud<T> {
    create: Create<T>;
    getById: GetById<T>;
    deleteById: DeleteById<T>;
    replaceById: ReplaceById<T>;
    search: Search<T>;
    utilities: Utilities;
}

export type Create<T> = (entity: T, context: ExecutionContext) => Promise<T>;
export type GetById<T> = (id: string) => Promise<T>;
export type DeleteById<T> = (id: string, context: ExecutionContext) => Promise<void>;
export type ReplaceById<T> = (entity: T, context: ExecutionContext) => Promise<T>;
export type Search<T> = (query: Query) => Promise<T[]>;

export interface Auditors {
    writeCreation: (entityAfterCreation: Object, context: ExecutionContext) => Promise<void>;
    writeDeletion: (deletedObject: Object, context: ExecutionContext) => Promise<void>;
    writeReplacement: (
        oldEntity: Object,
        newEntity: Object,
        context: ExecutionContext
    ) => Promise<void>;
}

export type SetStringIdentifier = (item: Object) => void;

export type GetUtils = (params: CreateUtilityParams) => Promise<Utilities>;
