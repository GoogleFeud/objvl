
import { Objvl } from "../../dist/compiler/index";

test("minLen", () => {
    const validator = Objvl.compile({
        properties: {
            members: { type: "array", minLen: 5, errors: {
                minLen: (val, min) => `Members array needs at least ${min} elements`
            } }
        },
    });

    const [, errors] = validator({ members: [1, 2, 3]});
    expect(errors[0]).toBe("Members array needs at least 5 elements");

    const [, errors2] = validator({});
    expect(errors2[0]).toBe(0);
});

test("maxLen", () => {
    const validator = Objvl.compile({
        properties: {
            members: { type: "array", maxLen: 5, optional: true, errors: {
                type: () => "Members needs to be an array",
                maxLen: (val, max) => `Members array cannot exceed ${max} elements`
            } }
        },
    });

    const [, errors] = validator({ members: [1, 2, 3, 4, 5, 6]});
    expect(errors[0]).toBe("Members array cannot exceed 5 elements");

    const [, errors2] = validator({});
    expect(errors2[0]).toBe(undefined);

    const [, errors3] = validator({ members: null });
    expect(errors3[0]).toBe("Members needs to be an array");
});

test("items (all)", () => {
    const validator = Objvl.compile({
        properties: {
            members: { type: "array", maxLen: 10, items: { 
                type: "integer", 
                max: 5, 
                errors: {
                    max: (val, max) => `Items inside members array cannot be larger than ${max}`,
                    type: () => "Items inside members need to be integers."
                }}, errors: {
                type: () => "Members needs to be an array",
                maxLen: (val, max) => `Members array cannot exceed ${max} elements`
            } }
        },
    });

    const [, errors] = validator({ members: [1, 2, 3, 4, 5, 6] });
    expect(errors[0]).toBe("Items inside members array cannot be larger than 5");

    const [, errors2] = validator({ members: [1, 2.5, 3.10]});
    expect(errors2.length).toBe(1);

    const [, errors3] = validator({ members: [1, 2, 3, 6.1, 1, 2, 3, 1, 2, 1, 4, 2, 3, 4.2] });
    expect(errors3[0]).toBe("Members array cannot exceed 10 elements");
});

test("items (tuple)", () => {
    const validator = Objvl.compile({
        properties: {
            members: { type: "array", items: [
                { type: "string", maxLen: 10, errors: {
                    maxLen: (_, maxLen) => `Max length of members[0] must is ${maxLen}`
                }}, 
                {
                    type: "float", max: 100, errors: {
                        max: (_, max) => `Max of members[1] must be below ${max}`
                    }}
            ], 
            errors: {
                type: () => "Members needs to be an array",
            }}
        },
    });

    const [, errors] = validator({ members: ["abc", 55]});
    expect(errors[0]).toBe(undefined);

    const [, errors2] = validator({ members: ["abcdefgwijwudwud", 44.5]});
    expect(errors2[0]).toBe("Max length of members[0] must is 10");

    const [, errors3] = validator({ members: ["abc", 115, 340]});
    expect(errors3[0]).toBe("Max of members[1] must be below 100");

});

test("optional tuple items", () => {
    const validator = Objvl.compile({
        properties: {
            members: { type: "array", items: [
                { type: "string", maxLen: 10, errors: {
                    maxLen: (_, maxLen) => `Max length of members[0] must is ${maxLen}`
                }}, 
                {
                    type: "float", max: 100, optional: true, errors: {
                        max: (_, max) => `Max of members[1] must be below ${max}`
                    }}
            ], 
            errors: {
                type: () => "Members needs to be an array",
            }}
        },
    });

    const [, errors] = validator({ members: ["abc"]});
    expect(errors[0]).toBe(undefined);
});