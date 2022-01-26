

import { Objvl } from "./compiler";

const validator = Objvl.compile({
    properties: {
        name: { type: "string", validator: (str) => str !== "abc", errors: {
            type: () => "Expected property 'name' with type 'string'.",
            validator: () => "String must be exactly 'abc'"
        }},
        value: { type: "string", maxLen: 5, errors: {
            maxLen: () => "Value's max length is 5.",
            type: (actual) => actual === undefined ? "Value is required." : "Value must be a string."
        }}
    },
    required: ["value"],
    errors: {}
});

console.log(validator.toString());
console.log(validator({name: "abc"}));
