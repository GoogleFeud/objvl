
import { Builders } from "../dist";

test("security", () => {
    const validator = Builders.schema({
        name: Builders.number()
            .err("type", (val) => val),
        value: Builders.string()
            .validator((val) => val)
            .err("validator", (val, validatorVal) => validatorVal)
    });

    console.log(validator.toString());

    const [, errors] = validator({
        name: "console.log(1)",
        value: "console.log(2)"
    });
    
    expect(errors[0]).toBe("console.log(1)");
    expect(errors[1]).toBe("console.log(2)");
});