
import { Objvl } from "../../dist/compiler/index";

test("required", () => {
    const validator = Objvl.compile({
        properties: {
            age: { type: "number", errors: {
                type: (actual) => (actual === undefined || actual === null) ? "Received an empty age." : "Age must be a number."
            }}
        },
    });

    const [, errors] = validator({
        age: "Google"
    });

    expect(errors[0]).toBe("Age must be a number.");

    const [, errors2] = validator({});

    expect(errors2[0]).toBe("Received an empty age.");

    const [, errors3] = validator({ age: 123 });

    expect(errors3[0]).toBe(undefined);
});

test("min", () => {
    const validator = Objvl.compile({
        properties: {
            age: { type: "number", min: 13, optional: true, errors: {
                min: (val, min) => `Minimum age is ${min}`
            }}
        },
    });

    const [, errors] = validator({
        age: 48
    });

    expect(errors[0]).toBe(undefined);

    const [, errors2] = validator({});

    expect(errors2[0]).toBe(undefined);

    const [, errors3] = validator({ age: 5 });

    expect(errors3[0]).toBe("Minimum age is 13");
});

test("max", () => {
    const validator = Objvl.compile({
        properties: {
            age: { type: "number", max: 99, optional: true, errors: {
                max: (val, max) => `Maximum age is ${max}`
            }},
            someNum: { type: "integer", max: 100, errors: {
                max: (val, max) => `Maximum age is ${max}`,
                type: () => "someNum must be an integer."
            }}
        },
    });

    const [, errors] = validator({
        age: 48
    });

    expect(errors[0]).toBe("someNum must be an integer.");

    const [, errors2] = validator({age: 100.5, someNum: 3.14});

    expect(errors2.length).toBe(2);

    const [, errors3] = validator({ age: 5, someNum: 44 });

    expect(errors3[0]).toBe(undefined);
});