/* eslint-disable */

const Ajv = require("ajv");
const { Objvl } = require("../dist/compiler");
const b = require("benny");

b.suite("Compilation",
    b.add("Ajv", () => {
        const ajv = new Ajv();
        const result = ajv.compile({
            type: "object",
            properties: {
                name: { type: "string", minLength: 15 },
                value: { type: "string", maxLength: 33, minLength: 15 } 
            }
        });
    }),
    b.add("Objvl", () => {
        const result = Objvl.compile({
            properties: {
                name: { type: "string", maxLen: 15, errors: {
                    maxLen: () => "String length exceeded."
                }},
                value: { type: "string", maxLen: 33, minLen: 15, errors: {
                    maxLen: () => "String length exceeded.",
                    minLen: () => "String length must be at least 15 chars."
                }}
            }
        });
    }),
    b.cycle(),
    b.complete()
)

const ajv = new Ajv();
const resultAjv = ajv.compile({
    type: "object",
    properties: {
        name: { type: "string", minLength: 15 },
        value: { type: "string", maxLength: 33, minLength: 15 } 
    }
});

const resultObjvl = Objvl.compile({
    properties: {
        name: { type: "string", maxLen: 15, errors: {
            maxLen: () => { return "String length exceeded." }
        }},
        value: { type: "string", maxLen: 33, minLen: 15, errors: {
            maxLen: () => { return "String length exceeded." },
            minLen: () => { return "String length must be at least 15 chars." }
        }}
    }
});

b.suite("Validation",
    b.add("Objvl", () => {
        const res = resultObjvl({
            name: "abcccccccccccccccccccccccccccccccccccc",
            value: "1234567891011121314"
        });
    }),
    b.add("Ajv", () => {
        const res = resultAjv({
            name: "abcccccccccccccccccccccccccccccccccccc",
            value: "1234567891011121314"
        });
    }),
    b.cycle(),
    b.complete()
)