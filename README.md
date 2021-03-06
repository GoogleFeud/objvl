# objvl

`objvl` is a super fast object validator for javascript and typescript! It does **not** implement JSON schema validation, so if you're specifically looking for a validator which validates JSON Schema, I recommend using [ajv](https://ajv.js.org/). If you just want to validate an object, whether it's coming from a HTTP request or somewhere else, `objvl` is the right tool for the job!

Check out the guide [here](https://googlefeud.github.io/objvl/pages/Guides/Getting%20started.html)!

## Example

```ts
import { Builders } from "objvl";

// The builder pattern is optional
const validator = Builders.schema({
    name: Builders.string()
        .max(52)
        .err("maxLen", () => "\"name\" property cannot exceed 52 characters."),
    
    age: Builders.number()
        .integer()
        .min(13)
        .err("min", () => "\"age\" property must be above 13.")
});

const [obj, errors] = validator({
    name: "GoogleFeud",
    age: 10
});

// errors: ["\"name\" property cannot exceed 52 characters."]
```

## Features

- Unlike most other validators, objvl lets you define custom errors, which you receive right after calling the validation function. The errors could be anything - error codes you use later on, objects, or strings!
- Objvl is 90% faster than [joi](https://joi.dev/) and 70% faster than [ajv](https://ajv.js.org/). 
- Well tested and secure.

## Benchmarks

**Ajv version used: 8.9.0**     
**Joi version used: 17.6.0**

![Compilation](https://github.com/GoogleFeud/objvl/blob/main/benchmark/results/compilation.png?raw=true)
![Validation](https://github.com/GoogleFeud/objvl/blob/main/benchmark/results/validation.png?raw=true)

