/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ValidatorFn, compile } from "../index";
import { SchemaArrayType, SchemaBoolType, SchemaNumberType, SchemaObjectType, SchemaStringType, SchemaType, ValidationError } from "../compiler/types";

export function schema<T>(props: Record<string, AnyBuilder>, ...args: Array<string>) : ValidatorFn<T> {
    const properties: Record<string, SchemaType> = {};
    for (const propertyName in props) {
        properties[propertyName] = props[propertyName].finish();
    }
    return compile<T>({properties}, ...args);
}

export function string() : StringBuilder {
    return new StringBuilder();
}

export function number() : NumberBuilder {
    return new NumberBuilder();
}

export function bool() : BoolBuilder {
    return new BoolBuilder();
}

export function array(item?: AnyBuilder) : ArrayBuilder {
    return new ArrayBuilder(item);
}

export function object(props: Record<string, AnyBuilder>) : ObjectBuilder {
    return new ObjectBuilder(props);
}

class StringBuilder {
    inner: SchemaStringType;
    constructor() {
        this.inner = { type: "string", errors: {} };
    }

    max(number: number) : this {
        this.inner.maxLen = number;
        return this;
    }

    min(number: number) : this {
        this.inner.minLen = number;
        return this;
    }

    pattern(pattern: RegExp) : this {
        this.inner.pattern = pattern;
        return this;
    }

    optional() : this {
        this.inner.optional = true;
        return this;
    }

    validator(validator: ((val: string) => unknown) | string) : this {
        this.inner.validator = validator;
        return this;
    }

    err(kind: "maxLen" | "minLen" | "type" | "pattern" | "validator", value: ((...els: Array<any>) => ValidationError) | string) : this {
        this.inner.errors![kind] = value;
        return this;
    }

    finish() : Readonly<SchemaStringType> {
        return Object.freeze(this.inner);
    }
}

class NumberBuilder {
    inner: SchemaNumberType;
    constructor() {
        this.inner = { type: "number", errors: {} };
    }

    max(number: number) : this {
        this.inner.max = number;
        return this;
    }

    min(number: number) : this {
        this.inner.min = number;
        return this;
    }

    optional() : this {
        this.inner.optional = true;
        return this;
    }

    float() : this {
        this.inner.type = "float";
        return this;
    }

    integer() : this {
        this.inner.type = "integer";
        return this;
    }

    validator(validator: ((val: number) => unknown) | string) : this {
        this.inner.validator = validator;
        return this;
    }

    err(kind: "max" | "min" | "type" | "validator", value: ((...els: Array<any>) => ValidationError) | string) : this {
        this.inner.errors![kind] = value;
        return this;
    }

    finish() : Readonly<SchemaNumberType> {
        return Object.freeze(this.inner);
    }

}

class BoolBuilder {
    inner: SchemaBoolType;
    constructor() {
        this.inner = { type: "bool", errors: {} };
    }

    optional() : this {
        this.inner.optional = true;
        return this;
    }

    err(kind: "type", value: ((val: unknown) => ValidationError) | string) : this {
        this.inner.errors![kind] = value;
        return this;
    }

    finish() : Readonly<SchemaBoolType> {
        return Object.freeze(this.inner);
    }
}

class ArrayBuilder {
    inner: SchemaArrayType;
    constructor(item?: AnyBuilder) {
        this.inner = { type: "array", errors: {} };
        if (item) this.inner.items = item.finish();
    }

    max(number: number) : this {
        this.inner.maxLen = number;
        return this;
    }

    min(number: number) : this {
        this.inner.minLen = number;
        return this;
    }

    optional() : this {
        this.inner.optional = true;
        return this;
    }

    items(type: AnyBuilder) : this {
        this.inner.items = type.inner;
        return this;
    }

    tuple(types: Array<AnyBuilder>) : this {
        this.inner.items = types.map(t => t.finish());
        return this;
    }

    validator(validator: ((items: Array<unknown>) => unknown) | string) : this {
        this.inner.validator = validator;
        return this;
    }

    err(kind: "type" | "minLen" | "maxLen" | "validator", value: ((...els: Array<any>) => ValidationError) | string) : this {
        this.inner.errors![kind] = value;
        return this;
    }

    finish() : Readonly<SchemaArrayType> {
        return Object.freeze(this.inner);
    }

}

class ObjectBuilder {
    inner: SchemaObjectType;
    constructor(properties: Record<string, AnyBuilder>) {
        const props: Record<string, SchemaType> = {};
        for (const propertyName in properties) {
            props[propertyName] = properties[propertyName].finish();
        }
        this.inner = { type: "object", errors: {}, properties: props };
    }

    optional() : this {
        this.inner.optional = true;
        return this;
    }

    validator(validator: ((val: Record<string, unknown>) => unknown) | string) : this {
        this.inner.validator = validator;
        return this;
    }

    err(kind: "type" | "validator", value: ((...els: Array<any>) => ValidationError) | string) : this {
        this.inner.errors![kind] = value;
        return this;
    }

    finish() : Readonly<SchemaObjectType> {
        return Object.freeze(this.inner);
    }
}

type AnyBuilder = ArrayBuilder | StringBuilder | NumberBuilder | BoolBuilder | ObjectBuilder;