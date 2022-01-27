
export interface Schema {
    properties: Record<string, SchemaType>
}

export type ValidationError<T = Record<string, unknown>> = number | T & { code: number } | string;

export interface DefaultErrors {
    type?: (actual: unknown) => ValidationError
}

export interface SchemaStringType {
    type: "string",
    minLen?: number,
    maxLen?: number,
    pattern?: RegExp,
    validator?: (value: string) => unknown,
    optional?: boolean,
    errors?: DefaultErrors & {
        minLen?: (value: string, min: number) => ValidationError,
        maxLen?: (value: string, max: number) => ValidationError,
        pattern?: (value: string) => ValidationError,
        validator?: (value: string, validatorReturn: unknown) => ValidationError
    }
}

export interface SchemaNumberType {
    type: "number" | "integer" | "float",
    min?: number,
    max?: number,
    validator?: (value: number) => unknown,
    optional?: boolean,
    errors?: DefaultErrors & {
        min?: (value: number, min: number) => ValidationError,
        max?: (value: number, max: number) => ValidationError,
        validator?: (value: string, validatorReturn: unknown) => ValidationError
    }
}

export interface SchemaArrayType {
    type: "array",
    minLen?: number,
    maxLen?: number,
    items?: SchemaType | Array<SchemaType>,
    validator?: (value: Array<unknown>) => unknown,
    optional?: boolean,
    errors?: DefaultErrors & {
        minLen?: (value: Array<unknown>, min: number) => ValidationError,
        maxLen?: (value: Array<unknown>, max: number) => ValidationError,
        validator?: (value: Array<unknown>, validatorReturn: unknown) => ValidationError
    }
}

export interface SchemaBoolType {
    type: "bool",
    optional?: boolean,
    errors?: DefaultErrors
}

export interface SchemaObjectType {
    type: "object"
    properties: Record<string, SchemaType>,
    validator?: (value: Record<string, unknown>) => unknown,
    optional?: boolean,
    errors?: DefaultErrors & {
        validator?: (value: Record<string, unknown>, validatorReturn: unknown) => ValidationError
    }
}

export type SchemaType = SchemaStringType | SchemaNumberType | SchemaArrayType | SchemaObjectType | SchemaBoolType;