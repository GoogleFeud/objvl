---
name: Custom validators
order: 2
---

# Custom validators

## `validator` property

You can create completely custom validators using the `validator` property. If the provided function returns a falsey value, like `false`, `null`, `undefined`, `""` or `0`, then that means that the validator **pased**, and an error won't be returned. If it returns any other value, then it means there's an error, and the `validator` error function will be executed. The first parameter of the function will always be the value that got received, the second will be the value returned by the validator, and the third one is the path to the property.

```ts --Builders
const validator = Builder.schema({
    name: Builder.string()
        .validator(str => str.startsWith("--"))
        .err("validator", () => "The string cannot start with '--'")
});
```
```ts --Objects
const validator = {
    properties: {
        name: {
            type: "string",
            validator: str => str.startsWith("--"),
            errors: {
                validator: () => "The string cannot start with '--'"
            }
        }
    }
}
```

## Custom arguments

Since objvl compiles the schema into a function, you cannot use any variables inside the `validator` and `error` functions. To fix this, you can pass **custom argument names** in the `compile` function.

```ts
const validator = compile({...}, "arg1", "arg2");
```

And then call the validator like this:

```ts
const valueOutsideValidator = 42;
validator({...}, "Hello World", valueOutsideValidator);
```

Now the functions inside the validator can use the arguments `arg1` and the `valueOutsideValidator` variable! This creates another problem, though: If you're using an IDE, then it's going to complain that `arg1` and `arg2` are not defined. The only way to fix this is to pass the function as a string:

```ts --Builders
const validator = Builder.schema({
    name: Builder.string()
        .validator(str => str.startsWith("--"))
        .err("validator", "() => ({ code: errors.VALIDATOR })")
}, "errors");

const errors = { VALIDATOR: 1001 };
validator({...}, errors);
```
```ts --Objects
const validator = {
    properties: {
        name: {
            type: "string",
            validator: str => str.startsWith("--"),
            errors: {
                validator: () => "() => ({ code: errors.VALIDATOR })"
            }
        }
    }
}

const errors = { VALIDATOR: 1001 };
validator({...}, errors);
```