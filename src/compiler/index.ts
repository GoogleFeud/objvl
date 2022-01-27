
import { inlineFunc } from "./inliner";
import { Schema, SchemaArrayType, SchemaBoolType, SchemaNumberType, SchemaStringType, SchemaType, ValidationError } from "./types";

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
            void 0;
            return "";
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
        output += `if (typeof ${value} !== "string") err.push(${str.errors.type ? inlineFunc(str.errors.type, [value]) : "0"});`;
        if (str.maxLen) output += `else if(${value}.length > ${str.maxLen}) err.push(${str.errors.maxLen ? inlineFunc(str.errors.maxLen, [value, str.maxLen.toString()]) : "0"});`;
        if (str.minLen) output += `else if(${value}.length < ${str.minLen}) err.push(${str.errors.minLen ? inlineFunc(str.errors.minLen, [value, str.minLen.toString()]) : "0"});`;
        if (str.pattern) output += `else if(${str.pattern}.test(${value})) err.push(${str.errors.pattern ? inlineFunc(str.errors.pattern, [value]) : "0"});`;
        if (str.validator) output += `else if(temp=${inlineFunc(str.validator, [value])}) err.push(${str.errors.validator ? inlineFunc(str.errors.validator, [value,  "temp"]) : "0"});`;
        if (str.optional) output += "};";
        return output;
    }

    private static compileNumber(obj: string, name: CompilePropName, num: SchemaNumberType) : string {
        const value = this.buildProp(obj, name);
        let output = "";
        if (num.optional) output += `if("${name}" in _){`;
        if (num.type === "number" || num.type === "float") output += `if(typeof ${value} !== "number") err.push(${num.errors.type ? inlineFunc(num.errors.type, [value]) : "0"});`;
        else if (num.type === "integer") output += `if(typeof ${value} !== "number" || ${value} % 1 !== 0) err.push(${num.errors.type ? inlineFunc(num.errors.type, [value]) : "0"});`;

        if (num.max) output += `else if(${value} > ${num.max}) err.push(${num.errors.max ? inlineFunc(num.errors.max, [value, num.max.toString()]) : "0"});`;
        if (num.min) output += `else if(${value} < ${num.min}) err.push(${num.errors.min ? inlineFunc(num.errors.min, [value, num.min.toString()]) : "0"});`;
        if (num.validator) output += `elseif (temp=${inlineFunc(num.validator, [value])}) err.push(${num.errors.validator ? inlineFunc(num.errors.validator, [value, "temp"]) : "0"});`;
        if (num.optional) output += "};";
        return output;
    }

    private static compileBool(obj: string, name: CompilePropName, bool: SchemaBoolType) : string {
        const value = this.buildProp(obj, name);
        let output = "";
        if (bool.optional) output += `if("${name}" in _){`;
        output += `if(typeof ${value} !== "boolean") err.push(${bool.errors.type ? inlineFunc(bool.errors.type, [value]) : "0"});`;
        if (bool.optional) output += "};";
        return output;
    }

    private static compileArray(obj: string, name: CompilePropName, arr: SchemaArrayType) : string {
        const value = this.buildProp(obj, name);
        let output = "";
        if (arr.optional) output += `if("${name}" in _){`;
        output += `if(typeof ${value} !== "object" || !Array.isArray(${value})) err.push(${arr.errors.type ? inlineFunc(arr.errors.type, [value]) : "0"});`;
        if (arr.minLen) output += `else if(${value}.length < ${arr.minLen}) err.push(${arr.errors.minLen ? inlineFunc(arr.errors.minLen, [value, arr.minLen.toString()]) : "0"});`;
        if (arr.maxLen) output += `else if(${value}.length > ${arr.maxLen}) err.push(${arr.errors.maxLen ? inlineFunc(arr.errors.maxLen, [value, arr.maxLen.toString()]) : "0"});`;
        if (arr.validator) output += `else if(temp=${inlineFunc(arr.validator, [value])}) err.push(${arr.errors.validator ? inlineFunc(arr.errors.validator, [value, "temp"]) : "0"});`;
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

    private static buildProp(obj: string, name: CompilePropName) : string {
        if (typeof name === "number") return `${obj}[${name}]`;
        else if (typeof name === "string") return `${obj}["${name}"]`;
        else return `${obj}[${name.direct}]`;
    }


}