
import { Objvl } from "../../dist/compiler/index";

test("Required", () => {
    const validator = Objvl.compile({
        properties: {
            name: { type: "string", errors: {
                type: (actual) => (actual === undefined || actual === null) ? "Received an empty name." : "Name must be a string."
            }}
        },
        required: ["name"],
        errors: {}
    });

    const [, errors] = validator({
        name: "Google"
    });

    expect(errors.length).toBe(0);

    const [, errors2] = validator({});

    expect(errors2.length).toBe(1);
});

test("minLen", () => {
    const validator = Objvl.compile({
        properties: {
            name: { type: "string", minLen: 10, errors: {
                minLen: (text, minLen) => `Invalid minLen. ${minLen}`
            }}
        },
        errors: {}
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
    const validator = Objvl.compile({
        properties: {
            name: { type: "string", maxLen: 5, errors: {
                maxLen: (text, minLen) => `Invalid maxLen. ${minLen}`
            }}
        },
        errors: {}
    });

    console.log(validator.toString());

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