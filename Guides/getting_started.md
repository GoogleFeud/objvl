---
name: Getting started
order: 1
---

# Getting started

Objvl is a **fast** and **safe** object validator for javascript and typescript. It compiles your schemas to easily optimizable javascript code!

## Install

```
npm i objvl
```

## Basic schema

A "schema" describes how the object should look. Every schema has a list of properties, and each of them has a [[SchemaType as type]]. 

You can write schemas in two ways: the builder pattern, which is very similar to **joi**, or via objects, which is similar to **ajv**. 

The following code creates a function which makes sure an object you pass to it has:
- The property "name", which must be a string, with maximum 52 characters in it
- The property "age", which is an integer, with minimum value of 13.

By default, both properties are **required**. You can make them optional by setting `optional` to true, and as you can see, we handle all the possible errors ourselves. `objvl` has default errors built in, but it's always a good practice to handle the errors yourself.

```ts --Builders
const validator = Builders.schema({
    name: Builders.string()
        .max(52)
        .err("type", () => "Name must be a string.")
        .err("maxLen", (_val, maxLen) => `Name cannot exceed ${maxLen} characters.`)
    age: Builders.number()
        .integer()
        .min(13)
        .err("type", () => "Age must be an integer.")
        .err("min", (_val, minLen) => `Number must be bigger than ${minLen}`)
});

const [data, errors] = validator({
    name: "Robert",
    age: 22
});
```
```ts --Objects
const validator = compile({
    properties: {
        name: {
            type: "string",
            maxLen: 52,
            errors: {
                type: () => "Name must be a string",
                maxLen: (_val, maxLen) => `Name cannot exceed ${maxLen} characters.`
            }
        },
        age: {
            type: "integer",
            min: 13,
            errors: {
                type: () => "Age must be an integer.",
                min: (_val, minLen) => `Number must be bigger than ${minLen}`
            }
        }
    }
});

const [data, errors] = validator({
    name: "Robert",
    age: 22
});
```

You can also not create string errors, and instead just use numbers, which specify the type of the error, and let the client handle them. The following example just sends numbers, but you could send extra data such as the name of the field that the error comes from, and the actual value received.

```ts
const enum Errors {
    MustBeStr,
    MaxLen
}
```

```ts --Builders
const validator = Builders.schema({
    name: Builders.string()
        .max(52)
        .err("type", () => Errors.MustBeStr)
        .err("maxLen", () => Errors.MaxLen)
});
```
```ts --Objects
const validator = compile({
        properties: {
        name: {
            type: "string",
            maxLen: 52,
            errors: {
                type: () => Errors.MustBeStr,
                maxLen: (_val, maxLen) => Errors.MaxLen
            }
        },
    }
});
```

This way you decide how the errors should look, so there's no overhead - objvl doesn't create error objects, from which you only need one piece of information. 

|>[note] Objvl reduces error overhead by inlining arrow functions which have a single expression as their body!