import { Db, IndexOptions, Collection } from 'mongodb';
import { Validator } from '../validation/ajv';
import { ExecutionContext } from '../version-info/types';
import { EntityMetadata } from '../entity-metadata/types';
import { Enforcer } from 'casbin';

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
    enforcer?: Enforcer;
    titleToStringIdentifier?: TitleToStringIdentifier;
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
    setTenant: SetTenant;
    addTenantToFilter: AddTenantToFilter;
    enforcer?: Enforcer;
    setOwnerIfApplicable: SetOwnerIfApplicable;
    titleToStringIdentifier: TitleToStringIdentifier;
    setStatuses: SetStatusesIfApplicable;
}

export interface Crud<T> {
    create: Create<T>;
    getById: GetById<T>;
    deleteById: DeleteById<T>;
    replaceById: ReplaceById<T>;
    search: Search<T>;
}

export type Create<T> = (entity: T, context: ExecutionContext, hooks?: Hooks) => Promise<T>;
export type GetById<T> = (id: string, context: ExecutionContext, hooks?: Hooks) => Promise<T>;
export type DeleteById<T> = (id: string, context: ExecutionContext, hooks?: Hooks) => Promise<void>;
export type ReplaceById<T> = (
    id: string,
    entity: T,
    context: ExecutionContext,
    hooks?: Hooks
) => Promise<T>;
export type Search<T> = (
    query: Query | Object,
    context: ExecutionContext,
    hooks?: Hooks
) => Promise<{ items: T[] }>;

export interface Auditors<T> {
    writeCreation: WriteCreation<T>;
    writeDeletion: WriteDeletion<T>;
    writeReplacement: WriteReplacement<T>;
    writeAuditEntry: WriteAuditEntry<T>;
}

export type WriteCreation<T> = (entityAfterCreation: T, context: ExecutionContext) => Promise<void>;
export type WriteDeletion<T> = (deletedObject: T, context: ExecutionContext) => Promise<void>;
export type WriteReplacement<T> = (newEntityState: T, context: ExecutionContext) => Promise<void>;
export type WriteAuditEntry<T> = (
    currentEntitState: T,
    context: ExecutionContext,
    action: String
) => Promise<void>;

export type SetStringIdentifier = (item: Object) => void;
export type CreateSetTenant = (metatada: EntityMetadata) => SetTenant;
export type SetTenant = (entity: any, context: ExecutionContext) => void;
export type CreateAddTenantToFilter = (metatada: EntityMetadata) => AddTenantToFilter;
export type AddTenantToFilter = (query: Query, context: ExecutionContext) => void;
export type GetUtils = (params: CreateUtilityParams) => Promise<Utilities>;
export type SetOwnerIfApplicable = (entity: any, context: ExecutionContext) => void;
export type SetStatusesIfApplicable = (
    entity: any,
    existingEntity: any,
    context: ExecutionContext
) => void;
export type TitleToStringIdentifier = (title: string) => string;

export interface UrlConfig {
    username?: string;
    password?: string;
    server: string;
    dbName: string;
}

export interface Index {
    key: string | object;
    options: IndexOptions;
}

export interface Query {
    filter: any;
    skip?: number;
    limit?: number;
    sort?: { [key: string]: -1 | 1 };
    projection?: { [key: string]: 0 | 1 };
}

export interface QueryStringMapperOptions {
    skip?: number;
    limit?: number;
    sort?: { [key: string]: -1 | 1 };
    projection?: { [key: string]: 0 | 1 };
    agpOptions?: AgpOptions;
}

export interface AgpOptions {
    /** Custom skip operator key
     * @default 'skip' */
    skipKey?: string;

    /** Custom limit operator key
     * @default 'limit' */
    limitKey?: string;

    /** Custom sort operator key
     * @default 'sort' */
    sortKey?: string;

    /** Custom projection operator key
     * @default 'fields' */
    projectionKey?: string;

    /** Custom filter operator key
     * @default 'filter' */
    filterKey?: string;

    /** Filter on all keys except the ones specified */
    blacklist?: string[];

    /** Filter only on the keys specified */
    whitelist?: string[];

    /** object to specify custom casters, key is the caster name, and value is a function which is passed the query parameter value as parameter. */
    caster?: { [key: string]: () => any };

    /** object which map keys to casters (built-in or custom ones using the casters option). */
    castParams: { [key: string]: string };
}

export type Hook = (hookContext: HookContext) => Promise<void>;

export interface Hooks {
    [key: string]: Hook;
}

export interface HookContext {
    executionContext: ExecutionContext;
    /** The raw input that was passed in */
    input?: any;
    /** The id of the entity as passed in */
    id?: string;
    utilities: Utilities;
    /** The entity currently being worked with*/
    entity?: any;
    /** The entity in its exisitng stored state*/
    existingEntity?: any;
    query?: Query;
    hooks: Hooks;
    /** Any additional properties */
    [key: string]: any;
}
