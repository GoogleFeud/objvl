
import { compile } from "../../dist/compiler/index";

test("required", () => {
    const validator = compile({
        properties: {
            name: { type: "string", errors: {
                type: (actual) => (actual === undefined || actual === null) ? "Received an empty name." : "Name must be a string."
            }}
        }
    });

    const [, errors] = validator({
        name: "Google"
    });

    expect(errors.length).toBe(0);

    const [, errors2] = validator({});

    expect(errors2.length).toBe(1);
});

test("minLen", () => {
    const validator = compile({
        properties: {
            name: { type: "string", minLen: 10, errors: {
                minLen: (text, minLen) => `Invalid minLen. ${minLen}`
            }}
        },
    });

    const [, errors] = validator({
        name: "abc"
    });

    expect(errors[0]).toBe("Invalid minLen. 10");

    const [, errors2] = validator({
        name: "abc2e3e3e3e3e3e3e3d3d333d33"
    });

    expect(errors2[0]).toBe(undefined);
});

test("maxLen", () => {
    const validator = compile({
        properties: {
            name: { type: "string", maxLen: 5, optional: true, errors: {
                maxLen: (text, minLen) => `Invalid maxLen. ${minLen}`
            }}
        },
    });
    
    const [, errors] = validator({
        name: "abc"
    });

    expect(errors[0]).toBe(undefined);

    const [, errors2] = validator({
        name: "abc2e3e3e3e3e3e3e3d3d333d33"
    });

    expect(errors2[0]).toBe("Invalid maxLen. 5");

    const [, errors3] = validator({});

    expect(errors3[0]).toBe(undefined);
});

test("validator", () => {
    const validator = compile({
        properties: {
            name: { type: "string", validator: (value) => value.startsWith("obj") ? 1 : false, errors: {
                validator: (val, rtrn) => rtrn as number
            }}
        },
    });

    const [, errors] = validator({
        name: "object"
    });

    expect(errors[0]).toBe(1);
});

test("multiple errors", () => {
    const validator = compile({
        properties: {
            name: { type: "string", validator: (value) => value.startsWith("obj") ? 1 : false, errors: {
                validator: (val, rtrn) => rtrn as number
            }},
            name2: { type: "string", minLen: 1000, errors: {
                minLen: () => "Min length error."
            } }
        }
    });

    const [, errors] = validator({
        name: "obj",
        name2: "abc"
    });

    expect(errors.length).toBe(2);
});

test("pattern", () => {
    const validator = compile({
        properties: {
            date: { type: "string", pattern: /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, errors: {
                pattern: () => "Invalid date."
            }},
        }
    });

    const [, errors] = validator({ date: "10203234"});

    expect(errors[0]).toBe("Invalid date.");
});