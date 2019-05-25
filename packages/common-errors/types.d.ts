export interface BaseErrorParameters {
    message: string;
    name: string;
    codeSuffix: string;
    /** If applicable, a wrapped inner error */
    innerError?: Error;
    /**
     * Specifies if the error is safe to show to a user
     * @default false
     */
    safeToShowToUsers?: boolean;
    /** A map of extra properties to include in the output of the error */
    decorate: any;
    httpStatusCode?: number;
}

export interface ErrorParameters {
    /** If applicable, a wrapped inner error */
    innerError?: Error;
    /**
     * Specifies if the error is safe to show to a user
     * @default false
     */
    safeToShowToUsers?: boolean;
    /** A map of extra properties to include in the output of the error */
    decorate: any;
}

export interface KrimZenNinjaBaseErrorClass extends Error {
    message: string;
    name: string;
    code: string;
    /** If applicable, a wrapped inner error */
    innerError?: Error;
    /**
     * Specifies if the error is safe to show to a user
     * @default false
     */
    safeToShowToUsers?: boolean;
    /** A map of extra properties to include in the output of the error */
    decorate: any;
    httpStatusCode?: number;
    /** Converts the error to a string */
    toString: (level: number) => string;
}
