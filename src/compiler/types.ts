
export interface Schema {
    properties: Record<string, SchemaType>
}

export type ValidationError<T = Record<string, unknown>> = number | T & { code: number } | string;

export interface DefaultErrors {
    type?: ((actual: unknown, depth: string) => ValidationError) | string
}

export interface SchemaStringType {
    type: "string",
    minLen?: number,
    maxLen?: number,
    pattern?: RegExp,
    validator?: ((value: string) => unknown) | string,
    optional?: boolean,
    errors?: DefaultErrors & {
        minLen?: ((value: string, min: number, depth: string) => ValidationError) | string,
        maxLen?: ((value: string, max: number, depth: string) => ValidationError) | string,
        pattern?: ((value: string, depth: string) => ValidationError) | string,
        validator?: ((value: string, validatorReturn: unknown, depth: string) => ValidationError) | string
    }
}

export interface SchemaNumberType {
    type: "number" | "integer" | "float",
    min?: number,
    max?: number,
    validator?: ((value: number) => unknown) | string,
    optional?: boolean,
    errors?: DefaultErrors & {
        min?: ((value: number, min: number, depth: string) => ValidationError) | string,
        max?: ((value: number, max: number, depth: string) => ValidationError) | string,
        validator?: ((value: string, validatorReturn: unknown, depth: string) => ValidationError) | string
    }
}

export interface SchemaArrayType {
    type: "array",
    minLen?: number,
    maxLen?: number,
    items?: SchemaType | Array<SchemaType>,
    validator?: ((value: Array<unknown>) => unknown) | string,
    optional?: boolean,
    errors?: DefaultErrors & {
        minLen?: ((value: Array<unknown>, min: number, depth: string) => ValidationError) | string,
        maxLen?: ((value: Array<unknown>, max: number, depth: string) => ValidationError) | string,
        validator?: ((value: Array<unknown>, validatorReturn: unknown, depth: string) => ValidationError) | string
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
    validator?: ((value: Record<string, unknown>) => unknown) | string,
    optional?: boolean,
    errors?: DefaultErrors & {
        validator?: ((value: Record<string, unknown>, validatorReturn: unknown, depth: string) => ValidationError) | string
    }
}

export type SchemaType = SchemaStringType | SchemaNumberType | SchemaArrayType | SchemaObjectType | SchemaBoolType;