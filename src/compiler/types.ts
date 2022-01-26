
export type Schema = Omit<SchemaObjectType, "type">;

export type ValidationError<T = Record<string, unknown>> = number | T & { code: number } | string;

export interface DefaultErrors {
    missing?: () => ValidationError,
    type?: (actual: unknown) => ValidationError
}

export interface SchemaStringType {
    type: "string",
    minLen?: number,
    maxLen?: number,
    pattern?: RegExp,
    validator?: (value: string) => boolean;
    errors: DefaultErrors & {
        minLen?: (value: string, min: number) => ValidationError,
        maxLen?: (value: string, max: number) => ValidationError,
        pattern?: (value: string) => ValidationError,
        validator?: (value: string) => ValidationError
    }
}

export interface SchemaNumberType {
    type: "number" | "i32" | "i16" | "i8" | "u32" | "u16" | "u8" | "float" | "f32",
    min?: number,
    max?: number,
    validator?: (value: number) => boolean,
    errors: DefaultErrors & {
        min?: (value: number, min: number) => ValidationError,
        max?: (value: number, max: number) => ValidationError,
        validator?: (value: string) => ValidationError
    }
}

export interface SchemaArrayType {
    type: "array",
    minLen?: number,
    maxLen?: number,
    items?: SchemaType | Array<SchemaType>,
    validator?: (value: Array<unknown>) => boolean,
    errors: DefaultErrors & {
        minLen?: (value: number, min: number) => ValidationError,
        maxLen?: (value: number, max: number) => ValidationError,
        validator?: (value: string) => ValidationError
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
    validator?: (value: Record<string, unknown>) => boolean,
    errors: DefaultErrors & {
        required?: (value: number, min: number) => ValidationError,
        allowExtra?: () => ValidationError,
        validator?: (value: Record<string, unknown>) => ValidationError
    }
}

export type SchemaType = SchemaStringType | SchemaNumberType | SchemaArrayType | SchemaObjectType | SchemaBoolType;