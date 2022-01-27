
import { inlineFunc } from "./inliner";
import { Schema, SchemaBoolType, SchemaNumberType, SchemaStringType, ValidationError } from "./types";

export interface ObjvlConfig {
    allErrors?: boolean
}

export interface ValidatorFn<T> {
    (data: unknown) : [value: T, errors: Array<ValidationError>],
}

export class Objvl {
    validators: Record<string, ValidatorFn<unknown>>;
    config: ObjvlConfig;
    constructor(config: ObjvlConfig) {
        this.validators = {};
        this.config = config;
    }

    static compile<T>(schema: Schema) : ValidatorFn<T> {
        let code = "err=[];temp=undefined;";
        for (const propertyName in schema.properties) {
            const prop = schema.properties[propertyName];
            switch (prop.type) {
            case "string":
                code += this.compileString("_", propertyName, schema, prop);
                break;
            case "bool":
                code += this.compileBool("_", propertyName, schema, prop);
                break;
            case "object":
                void 0;
                break;
            case "array":
                void 0;
                break;
            default:
                code += this.compileNumber("_", propertyName, schema, prop);
                break;
            }
        }
        code += "return [_, err];";
        return new Function("_", code) as ValidatorFn<T>;
    }

    private static compileString(obj: string, name: string, parent: Schema, str: SchemaStringType) : string {
        const value = `${obj}["${name}"]`;
        let output = "";
        const isOptional = !parent.required?.includes(name);
        if (isOptional) output += `if ("${name}" in _) {`;
        output += `if (typeof ${value} !== "string") err.push(${str.errors.type ? inlineFunc(str.errors.type, [value]) : "0"});`;
        if (str.maxLen) output += `else if (${value}.length > ${str.maxLen}) err.push(${str.errors.maxLen ? inlineFunc(str.errors.maxLen, [value, str.maxLen.toString()]) : "0"});`;
        if (str.minLen) output += `else if (${value}.length < ${str.minLen}) err.push(${str.errors.minLen ? inlineFunc(str.errors.minLen, [value, str.minLen.toString()]) : "0"});`;
        if (str.pattern) output += `else if (${str.pattern}.test(${value})) err.push(${str.errors.pattern ? inlineFunc(str.errors.pattern, [value]) : "0"});`;
        if (str.validator) output += `else if (temp=${inlineFunc(str.validator, [value])}) err.push(${str.errors.validator ? inlineFunc(str.errors.validator, [value,  "temp"]) : "0"});`;
        if (isOptional) output += "};";
        return output;
    }

    private static compileNumber(obj: string, name: string, parent: Schema, num: SchemaNumberType) : string {
        const value = `${obj}["${name}"]`;
        let output = "";
        const isOptional = !parent.required?.includes(name);
        if (isOptional) output += `if ("${name}" in _) {`;
        if (num.type === "number" || num.type === "float") output += `if (typeof ${value} !== "number") err.push(${num.errors.type ? inlineFunc(num.errors.type, [value]) : "0"});`;
        else if (num.type === "integer") output += `if (typeof ${value} !== "number" || ${value} % 1 !== 0) err.push(${num.errors.type ? inlineFunc(num.errors.type, [value]) : "0"});`;

        if (num.max) output += `else if (${value} > ${num.max}) err.push(${num.errors.max ? inlineFunc(num.errors.max, [value, num.max.toString()]) : "0"});`;
        if (num.min) output += `else if (${value} < ${num.min}) err.push(${num.errors.min ? inlineFunc(num.errors.min, [value, num.min.toString()]) : "0"});`;
        if (num.validator) output += `else if (temp=${inlineFunc(num.validator, [value])}) err.push(${num.errors.validator ? inlineFunc(num.errors.validator, [value, "temp"]) : "0"});`;
        if (isOptional) output += "};";
        return output;
    }

    private static compileBool(obj: string, name: string, parent: Schema, bool: SchemaBoolType) : string {
        const value = `${obj}["${name}"]`;
        let output = "";
        const isOptional = !parent.required?.includes(name);
        if (isOptional) output += `if ("${name}" in _) {`;
        output += `if (typeof ${value} !== "boolean") err.push(${bool.errors.type ? inlineFunc(bool.errors.type, [value]) : "0"});`;
        if (isOptional) output += "};";
        return output;
    }


}