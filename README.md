# objvl

`objvl` is a super fast object validator! You're probably asking yourself... *Ugh... another validator...*, nope! `objvl` does it differently!

`objvl` does **not** implement JSON schema validation, so if you're specifically looking for a validator which validates JSON Schema, I recommend using [ajv](https://ajv.js.org/). If you just want to validate an object, whether it's coming from a HTTP request or somewhere else, `objvl` is the right tool for the job!

## Example

```ts
import { Builders } from "objvl";

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

- Unlike most other validators, `objvl` lets you define custom errors, which you receive right after calling the validation function. The errors could be anything - error codes you use later on, objects, or strings!
- Speed. `objvl` is 90% faster than [joi](https://joi.dev/) and 70% faster than [ajv](https://ajv.js.org/). 
- Well tested and secure.

## Benchmarks

**Ajv version used: 8.9.0**
**Joi version used: 17.6.0**

### Compilation

![Compilation](https://github.com/GoogleFeud/objvl/blob/main/benchmarks/results/compilation.png?raw=true)

### Validation

![Validation](https://github.com/GoogleFeud/objvl/blob/main/benchmarks/results/validation.png?raw=true)

