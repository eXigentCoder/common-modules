import { Context, HttpRequest, HttpResponse } from 'azure-functions-ts-essentials';
import { Crud, Query } from '../mongodb/types';
import { ExecutionContext } from '../version-info/types';

export type AzureWebRequest = (context: Context, req: HttpRequest) => Promise<HttpResponse>;
export type RequestHandler = (params: RequestParams) => Promise<any>;
export type FnWebRequest = (context: ExecutionContext, req: HttpRequest) => Promise<HttpResponse>;
export type HttpResponse = HttpResponse & { enableContentNegotiation: boolean };
export type AzureContext = Context;

export interface Logger {
    error: (...message: Array<any>) => void;
    warn: (...message: Array<any>) => void;
    info: (...message: Array<any>) => void;
    verbose: (...message: Array<any>) => void;
    metric: (...message: Array<any>) => void;
}

export interface RequestParams {
    context: ExecutionContext;
    req: HttpRequest;
    logger: Logger;
    rawContext: Context;
}

export interface CrudService extends Crud {
    mapQueryString: (any) => Query;
    [key: string]: any;
}

export interface VerbReqMap {
    GET?: RequestHandler;
    POST?: RequestHandler;
    PUT?: RequestHandler;
    DELETE?: RequestHandler;
    PATCH?: RequestHandler;
    OPTIONS?: RequestHandler;
}

export { HttpRequest, CrudService, AzureContext };
