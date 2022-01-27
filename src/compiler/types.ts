
export interface Schema {
    properties: Record<string, SchemaType>,
    required?: Array<string>
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
    errors: DefaultErrors & {
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
    errors: DefaultErrors & {
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
    errors: DefaultErrors & {
        minLen?: (value: number, min: number) => ValidationError,
        maxLen?: (value: number, max: number) => ValidationError,
        validator?: (value: Array<unknown>, validatorReturn: unknown) => ValidationError
    }
}

export interface SchemaBoolType {
    type: "bool",
    errors: DefaultErrors
}

export interface SchemaObjectType {
    type: "object"
    properties: Record<string, SchemaType>,
    required?: Array<string>,
    allowExtra?: boolean,
    validator?: (value: Record<string, unknown>) => unknown,
    errors: DefaultErrors & {
        required?: (value: number, min: number) => ValidationError,
        allowExtra?: () => ValidationError,
        validator?: (value: Record<string, unknown>, validatorReturn: unknown) => ValidationError
    }
}

export type SchemaType = SchemaStringType | SchemaNumberType | SchemaArrayType | SchemaObjectType | SchemaBoolType;