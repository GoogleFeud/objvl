

import { Objvl } from "../../dist/compiler/index";

test("required", () => {
    const validator = Objvl.compile({
        properties: {
            active: { type: "bool", errors: {
                type: (actual) => (actual === undefined || actual === null) ? "Active must be provided." : "Active must be a boolean."
            }}
        },
    });

    const [, errors] = validator({});

    expect(errors[0]).toBe("Active must be provided.");

    const [, errors1] = validator({ active: true });

    expect(errors1[0]).toBe(undefined);

    const [, errors2] = validator({ active: 1});

    expect(errors2[0]).toBe("Active must be a boolean.");
});