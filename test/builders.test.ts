
import { Builders } from "../dist";

test("builders", () => {
    const validator = Builders.schema({
        name: Builders.string()
            .max(12)
            .err("maxLen", (val: string, max: number) => `Field "name" cannot exceed ${max} characters.`)
            .err("type", () => "Field \"name\" must be a string."),

        roles: Builders.array(
            Builders.object({
                id: Builders.number().integer(),
                name: Builders.string()
            })
        )
            .optional()
    });

    const [, errors] = validator({
        name: "GoogleFeud"
    });
    expect(errors.length).toBe(0);

    const [, errors2] = validator({
        name: "GoogleFeudIsHereNow",
        roles: [
            {
                id: 12345
            },
        ]
    });
    expect(errors2.length).toBe(2);
});