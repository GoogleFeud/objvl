
import { inlineFunc } from "./inliner";
import { Schema, SchemaArrayType, SchemaBoolType, SchemaNumberType, SchemaObjectType, SchemaStringType, SchemaType, ValidationError } from "./types";

export interface ValidatorFn<T> {
    (data: unknown, ...args: Array<unknown>) : [value: T, errors: Array<ValidationError>],
}

type CompilePropName = string | number | { direct: string };

/**
 * Creates a very fast validation function from the provided object. The values for the argument names get passed when calling the function.
 * 
 * @example
 * ```js
 * const validator = compile({
 *    value: { type: "number", errors: {
 *         type: () => someExternalFn()
 *  }}
 * }, "someExternalFn")
 * 
 * validator({...}, () => console.log("I'm getting called inside the validator!"));
 * ```
 * 
 * @param schema The object to make a validator for
 * @param args Custom argument names that the validation function will be able to access.
 */
export function compile<T>(schema: Schema, ...args: Array<string>) : ValidatorFn<T> {
    let code = "let err=[],temp,len;";
    for (const propertyName in schema.properties) {
        code += compileType("_", propertyName, schema.properties[propertyName]);
    }
    code += "return [_, err];";
    return new Function("_", ...args, code) as ValidatorFn<T>;
}

function compileType(obj: string, name: CompilePropName, prop: SchemaType) : string {
    switch (prop.type) {
    case "string":
        return compileString(obj, name, prop);
    case "bool":
        return compileBool(obj, name, prop);
    case "object":
        return compileObject(obj, name, prop);
    case "array":
        return compileArray(obj, name, prop);
    default:
        return compileNumber(obj, name, prop);
    }
}

function compileString(obj: string, name: CompilePropName, str: SchemaStringType) : string {
    const value = buildProp(obj, name);
    const extractedPath = extractPath(value);
    let output = "";
    if (str.optional) output += `if ("${name}" in _){`;
    output += `if (typeof ${value} !== "string") err.push(${str.errors?.type ? inlineFunc(str.errors.type, [value, `"${extractedPath}"`]) : `"Property '${extractedPath}' must be a string."`});`;
    if (str.maxLen !== undefined) output += `else if(${value}.length > ${str.maxLen}) err.push(${str.errors?.maxLen ? inlineFunc(str.errors.maxLen, [value, str.maxLen.toString(), `"${extractedPath}"`]) : `"Property '${extractedPath}' cannot exceed ${str.maxLen} characters."`});`;
    if (str.minLen !== undefined) output += `else if(${value}.length < ${str.minLen}) err.push(${str.errors?.minLen ? inlineFunc(str.errors.minLen, [value, str.minLen.toString(), `"${extractedPath}"`]) : `"Property '${extractedPath}' must be at least ${str.minLen} characters."`});`;
    if (str.pattern) output += `else if(${str.pattern}.test(${value})) err.push(${str.errors?.pattern ? inlineFunc(str.errors.pattern, [value, `"${extractedPath}"`]) : `"Property '${extractedPath}}' does not match pattern '${str.pattern}'"`});`;
    if (str.validator) output += `else if(temp=${inlineFunc(str.validator, [value])}) err.push(${str.errors?.validator ? inlineFunc(str.errors.validator, [value,  "temp", `"${extractedPath}"`]) : `"Property '${extractedPath}': custom validator error."`});`;
    if (str.optional) output += "};";
    return output;
}

function compileNumber(obj: string, name: CompilePropName, num: SchemaNumberType) : string {
    const value = buildProp(obj, name);
    const extractedPath = extractPath(value);
    let output = "";
    if (num.optional) output += `if("${name}" in _){`;
    if (num.type === "number" || num.type === "float") output += `if(typeof ${value} !== "number") err.push(${num.errors?.type ? inlineFunc(num.errors.type, [value, `"${extractedPath}"`]) : `"Property '${extractedPath}' must be a number."`});`;
    else if (num.type === "integer") output += `if(typeof ${value} !== "number" || ${value} % 1 !== 0) err.push(${num.errors?.type ? inlineFunc(num.errors.type, [value, `"${extractedPath}"`]) : `"Property '${extractedPath}' must be an integer."`});`;

    if (num.max !== undefined) output += `else if(${value} > ${num.max}) err.push(${num.errors?.max ? inlineFunc(num.errors.max, [value, num.max.toString(), `"${extractedPath}"`]) : `"Property '${extractedPath}' must be > ${num.max}"`});`;
    if (num.min !== undefined) output += `else if(${value} < ${num.min}) err.push(${num.errors?.min ? inlineFunc(num.errors.min, [value, num.min.toString(), `"${extractedPath}"`]) : `"Property '${extractedPath}' must be < ${num.min}"`});`;
    if (num.validator) output += `elseif (temp=${inlineFunc(num.validator, [value])}) err.push(${num.errors?.validator ? inlineFunc(num.errors.validator, [value, "temp", `"${extractedPath}"`]) : `"Property '${extractedPath}': custom validator error."`});`;
    if (num.optional) output += "};";
    return output;
}

function compileBool(obj: string, name: CompilePropName, bool: SchemaBoolType) : string {
    const value = buildProp(obj, name);
    const extractedPath = extractPath(value);
    let output = "";
    if (bool.optional) output += `if("${name}" in _){`;
    output += `if(typeof ${value} !== "boolean") err.push(${bool.errors?.type ? inlineFunc(bool.errors.type, [value, `"${extractedPath}"`]) : `"Property '${extractedPath}' must be boolean."`});`;
    if (bool.optional) output += "};";
    return output;
}

function compileArray(obj: string, name: CompilePropName, arr: SchemaArrayType) : string {
    const value = buildProp(obj, name);
    const extractedPath = extractPath(value);
    let output = "";
    if (arr.optional) output += `if("${name}" in _){`;
    output += `if(typeof ${value} !== "object" || !Array.isArray(${value})) err.push(${arr.errors?.type ? inlineFunc(arr.errors.type, [value, `"${extractedPath}"`]) : `"Property '${extractedPath}' must be an array."`});`;
    if (arr.minLen !== undefined) output += `else if(${value}.length < ${arr.minLen}) err.push(${arr.errors?.minLen ? inlineFunc(arr.errors.minLen, [value, arr.minLen.toString(), `"${extractedPath}"`]) : `"Property '${extractedPath}' must have at least ${arr.minLen} elements."`});`;
    if (arr.maxLen !== undefined) output += `else if(${value}.length > ${arr.maxLen}) err.push(${arr.errors?.maxLen ? inlineFunc(arr.errors.maxLen, [value, arr.maxLen.toString(), `"${extractedPath}"`]) : `"Property '${extractedPath}' cannot have more than ${arr.maxLen} elements."`});`;
    if (arr.validator) output += `else if(temp=${inlineFunc(arr.validator, [value])}) err.push(${arr.errors?.validator ? inlineFunc(arr.errors.validator, [value, "temp", `"${extractedPath}"`]) : `"Property '${extractedPath}': custom validator error."`});`;
    if (arr.items) {
        output += "else{";
        if (Array.isArray(arr.items)) {
            for (let i=0; i < arr.items.length; i++) {
                output += compileType(value, i, arr.items[i]);
            }
        } else {
            output += `len=${value}.length;temp=err.length;while(len--){`;
            output += compileType(value, { direct: "len" }, arr.items);
            output += "if(err.length > temp) break;";
            output += "};";
        }
        output += "};";
    }
    if (arr.optional) output += "};";
    return output;
}

function compileObject(prevObj: string, name: CompilePropName, obj: SchemaObjectType) : string {
    const value = buildProp(prevObj, name);
    const extractedPath = extractPath(value);
    let output = "";
    if (obj.optional) output += `if("${name}" in _){`;
    output += `if (!${value} || ${value}.constructor.name !== "Object") err.push(${obj.errors?.type ? inlineFunc(obj.errors.type, [value, `"${extractedPath}"`]) : `"Property '${extractedPath}' must be an object."`});`;
    if (obj.validator) output += `else if(temp=${inlineFunc(obj.validator, [value])}) err.push(${obj.errors?.validator ? inlineFunc(obj.errors.validator, [value, "temp", `"${extractedPath}"`]) : `"Property '${extractedPath}': custom validator error."`});`;
    for (const propertyName in obj.properties) {
        output += `else ${compileType(value, propertyName, obj.properties[propertyName])}`;
    }
    if (obj.optional) output += "};";
    return output;
}

function buildProp(obj: string, name: CompilePropName) : string {
    if (typeof name === "number") return `${obj}[${name}]`;
    else if (typeof name === "string") return `${obj}["${name}"]`;
    else return `${obj}[${name.direct}]`;
}

function extractPath(path: string) : string {
    return path.slice(2, -1).replace(/]\[/g, "/").replace(/"/g, "");
}