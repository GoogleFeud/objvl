
import { inlineFunc } from "./inliner";
import { Schema, SchemaArrayType, SchemaBoolType, SchemaNumberType, SchemaObjectType, SchemaStringType, SchemaType, ValidationError } from "./types";

export interface ObjvlConfig {
    allErrors?: boolean
}

export interface ValidatorFn<T> {
    (data: unknown) : [value: T, errors: Array<ValidationError>],
}

type CompilePropName = string | number | { direct: string };

export class Objvl {
    validators: Record<string, ValidatorFn<unknown>>;
    config: ObjvlConfig;
    constructor(config: ObjvlConfig) {
        this.validators = {};
        this.config = config;
    }

    static compile<T>(schema: Schema) : ValidatorFn<T> {
        let code = "let err=[],temp,len;";
        for (const propertyName in schema.properties) {
            code += this.compileType("_", propertyName, schema.properties[propertyName]);
        }
        code += "return [_, err];";
        return new Function("_", code) as ValidatorFn<T>;
    }

    private static compileType(obj: string, name: CompilePropName, prop: SchemaType) : string {
        switch (prop.type) {
        case "string":
            return this.compileString(obj, name, prop);
        case "bool":
            return this.compileBool(obj, name, prop);
        case "object":
            return this.compileObject(obj, name, prop);
        case "array":
            return this.compileArray(obj, name, prop);
        default:
            return this.compileNumber(obj, name, prop);
        }
    }

    private static compileString(obj: string, name: CompilePropName, str: SchemaStringType) : string {
        const value = this.buildProp(obj, name);
        let output = "";
        if (str.optional) output += `if ("${name}" in _){`;
        output += `if (typeof ${value} !== "string") err.push(${str.errors?.type ? inlineFunc(str.errors.type, [value]) : `"Property '${this.normalizeValue(value)}' must be a string."`});`;
        if (str.maxLen !== undefined) output += `else if(${value}.length > ${str.maxLen}) err.push(${str.errors?.maxLen ? inlineFunc(str.errors.maxLen, [value, str.maxLen.toString()]) : `"Property '${this.normalizeValue(value)}' cannot exceed ${str.maxLen} characters."`});`;
        if (str.minLen !== undefined) output += `else if(${value}.length < ${str.minLen}) err.push(${str.errors?.minLen ? inlineFunc(str.errors.minLen, [value, str.minLen.toString()]) : `"Property '${this.normalizeValue(value)}' must be at least ${str.minLen} characters."`});`;
        if (str.pattern) output += `else if(${str.pattern}.test(${value})) err.push(${str.errors?.pattern ? inlineFunc(str.errors.pattern, [value]) : `"Property '${this.normalizeValue(value)}' does not match pattern '${str.pattern}'"`});`;
        if (str.validator) output += `else if(temp=${inlineFunc(str.validator, [value])}) err.push(${str.errors?.validator ? inlineFunc(str.errors.validator, [value,  "temp"]) : `"Property '${this.normalizeValue(value)}': custom validator error."`});`;
        if (str.optional) output += "};";
        return output;
    }

    private static compileNumber(obj: string, name: CompilePropName, num: SchemaNumberType) : string {
        const value = this.buildProp(obj, name);
        let output = "";
        if (num.optional) output += `if("${name}" in _){`;
        if (num.type === "number" || num.type === "float") output += `if(typeof ${value} !== "number") err.push(${num.errors?.type ? inlineFunc(num.errors.type, [value]) : `"Property '${this.normalizeValue(value)}' must be a number."`});`;
        else if (num.type === "integer") output += `if(typeof ${value} !== "number" || ${value} % 1 !== 0) err.push(${num.errors?.type ? inlineFunc(num.errors.type, [value]) : `"Property '${this.normalizeValue(value)}' must be an integer."`});`;

        if (num.max !== undefined) output += `else if(${value} > ${num.max}) err.push(${num.errors?.max ? inlineFunc(num.errors.max, [value, num.max.toString()]) : `"Property '${this.normalizeValue(value)}' must be > ${num.max}"`});`;
        if (num.min !== undefined) output += `else if(${value} < ${num.min}) err.push(${num.errors?.min ? inlineFunc(num.errors.min, [value, num.min.toString()]) : `"Property '${this.normalizeValue(value)}' must be < ${num.min}"`});`;
        if (num.validator) output += `elseif (temp=${inlineFunc(num.validator, [value])}) err.push(${num.errors?.validator ? inlineFunc(num.errors.validator, [value, "temp"]) : `"Property '${this.normalizeValue(value)}': custom validator error."`});`;
        if (num.optional) output += "};";
        return output;
    }

    private static compileBool(obj: string, name: CompilePropName, bool: SchemaBoolType) : string {
        const value = this.buildProp(obj, name);
        let output = "";
        if (bool.optional) output += `if("${name}" in _){`;
        output += `if(typeof ${value} !== "boolean") err.push(${bool.errors?.type ? inlineFunc(bool.errors.type, [value]) : `"Property '${this.normalizeValue(value)}' must be boolean."`});`;
        if (bool.optional) output += "};";
        return output;
    }

    private static compileArray(obj: string, name: CompilePropName, arr: SchemaArrayType) : string {
        const value = this.buildProp(obj, name);
        let output = "";
        if (arr.optional) output += `if("${name}" in _){`;
        output += `if(typeof ${value} !== "object" || !Array.isArray(${value})) err.push(${arr.errors?.type ? inlineFunc(arr.errors.type, [value]) : `"Property '${this.normalizeValue(value)}' must be an array."`});`;
        if (arr.minLen !== undefined) output += `else if(${value}.length < ${arr.minLen}) err.push(${arr.errors?.minLen ? inlineFunc(arr.errors.minLen, [value, arr.minLen.toString()]) : `"Property '${this.normalizeValue(value)}' must have at least ${arr.minLen} elements."`});`;
        if (arr.maxLen !== undefined) output += `else if(${value}.length > ${arr.maxLen}) err.push(${arr.errors?.maxLen ? inlineFunc(arr.errors.maxLen, [value, arr.maxLen.toString()]) : `"Property '${this.normalizeValue(value)}' cannot have more than ${arr.maxLen} elements."`}});`;
        if (arr.validator) output += `else if(temp=${inlineFunc(arr.validator, [value])}) err.push(${arr.errors?.validator ? inlineFunc(arr.errors.validator, [value, "temp"]) : `"Property '${this.normalizeValue(value)}': custom validator error."`});`;
        if (arr.items) {
            output += "else{";
            if (Array.isArray(arr.items)) {
                for (let i=0; i < arr.items.length; i++) {
                    output += this.compileType(value, i, arr.items[i]);
                }
            } else {
                output += `len=${value}.length;temp=err.length;while(len--){`;
                output += this.compileType(value, { direct: "len" }, arr.items);
                output += "if(err.length > temp) break;";
                output += "};";
            }
            output += "};";
        }
        if (arr.optional) output += "};";
        return output;
    }

    private static compileObject(prevObj: string, name: CompilePropName, obj: SchemaObjectType) : string {
        const value = this.buildProp(prevObj, name);
        let output = "";
        if (obj.optional) output += `if("${name}" in _){`;
        output += `if (!${value} || ${value}.constructor.name !== "Object") err.push(${obj.errors?.type ? inlineFunc(obj.errors.type, [value]) : `"Property '${this.normalizeValue(value)}' must be an object."`});`;
        if (obj.validator) output += `else if(temp=${inlineFunc(obj.validator, [value])}) err.push(${obj.errors?.validator ? inlineFunc(obj.errors.validator, [value, "temp"]) : `"Property '${this.normalizeValue(value)}': custom validator error."`});`;
        for (const propertyName in obj.properties) {
            output += `else ${this.compileType(value, propertyName, obj.properties[propertyName])}`;
        }
        if (obj.optional) output += "};";
        return output;
    }

    private static buildProp(obj: string, name: CompilePropName) : string {
        if (typeof name === "number") return `${obj}[${name}]`;
        else if (typeof name === "string") return `${obj}["${name}"]`;
        else return `${obj}[${name.direct}]`;
    }

    private static normalizeValue(val: string) : string {
        return val.slice(1).replace(/"/g, "");
    }


}