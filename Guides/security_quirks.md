---
name: Security and quirks
order: 4
---

# Security and quirks

## Security

|> You should NEVER, EVER compile untrusted schemas, unless you remove all error handlers and custom validators beforehand.

As long as the compiled schema is trusted, calling any compiled validator function should be completely safe. The only real security concern is code injection, and that's not possible in objvl, because it doesn't have access to the untrusted source code during compilation.

## Quirks

There are some quirks to objvl:

- Names of schema properties cannot include double quotes (`"`), or the code generation will fail.
- Only single-expression arrow functions can be inlined (`(...) => ...`) for extra performance.

## Performance tips

- Avoid using arrow functions with multiple expressions in custom validators and error handlers.
- Required properties are faster than optional ones.
- The compiler always gives you the most optimized code, so that's it :).