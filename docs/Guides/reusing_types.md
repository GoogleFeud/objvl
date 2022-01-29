---
name: Reusing types
order: 3
---

# Reusing types

Creating schemas can get repetitive if you have a lot of different objects which have properties of the exact same structure or type. Objvl allows you to reuse types and structures easily, and make your error handling more dynamic!

|> Once you pass an object to a schema, it gets frozen so you **cannot** modify it's contents!

```ts --Builders
const User = Builders.object({
    name: Builders.string()
        .err("type", (val, path) => `${path} must be a string.`)
    email: Builders.string()
        .pattern(/someemailregex/)
        .err("type", (val, path) => `${path} must be a string.`)
        .err("pattern", (val, path) => `${path} must be a valid email`)
    job: Builders.string()
        .optional()
        .max(32)
        .err("type", (val, path) => `${path} must be a string.`)
        .err("maxLen", (val, max, path) => `${path} cannot exceed 32 characters`)
});

const validateData = Builders.schema({
    users: Builders.array(User)
        .err("type", (val, path) => `${path} must be an array of users.`)
});
```
```ts --Objects
const User = {
    type: "object",
    properties: {
        name: {
            type: "string",
            errors: {
                type: (val, path) => `${path} must be a string.`
            }
        },
        email: {
            type: "string",
            pattern: /someemailregex/,
            errors: {
                type: (val, path) => `${path} must be a string.`,
                pattern: (val, path) => `${path} must be a valid email`,
            }
        },
        job: {
            type: "string",
            maxLen: 32,
            errors: {
                type: (val, path) => `${path} must be a string.`,
                maxLen: (val, max, path) => `${path} cannot exceed 32 characters`
            }
        }
    }
}

const validateData = {
    properties: {
        users: {
            type: "array",
            items: User,
            errors: {
                type: (val, path) => `${path} must be an array of users`
            }
        }
    }
}
```

#### Dynamic errors

Every error function's last argument is the **path** to that property. For example, for the object above, a valid error path would be `users/name`, `users`. You can use this string to determine what error to send, or you can directly include it in the error. 