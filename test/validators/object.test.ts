
import { Objvl } from "../../dist/compiler/index";

test("properties", () => {
    const validator = Objvl.compile({
        properties: {
            user: {
                type: "object",
                properties: {
                    name: { type: "string" },
                    age: { type: "number", optional: true }
                },
                errors: {
                    type: () => "User field must be an object."
                }
            }
        },
    });

    console.log(validator.toString());

    const [, errors] = validator({ user: { name: "Google", age: 18 } });
    expect(errors.length).toBe(0);

    const [, errors2] = validator({ user: { name: "Google" } });
    expect(errors2[0]).toBe(undefined);

    const [, errors3] = validator({ user: null });
    expect(errors3[0]).toBe("User field must be an object.");
});