/* eslint-disable */

const Ajv = require("ajv");
const { compile } = require("../dist/compiler");
const { performance } = require("perf_hooks");

const ajv = new Ajv({allErrors: true});
const resultAjv = ajv.compile({
    type: "object",
    properties: {
        name: { type: "string", minLength: 15 },
        value: { type: "string", maxLength: 33, minLength: 15 },
        age: { type: "number", maximum: 100, minimum: 15 }
    }
});

// Warmup
resultAjv({});

const resultObjvl = compile({
    properties: {
        name: { type: "string", maxLen: 15, errors: {
            maxLen: () => { return "String length exceeded." }
        }},
        value: { type: "string", maxLen: 33, minLen: 15, errors: {
            maxLen: (val, max) => `String length exceeded. Max string length is ${max}`,
            minLen: (val, min) => `String length must be at least ${min} chars.`
        }},
        age: { type: "number", max: 100, min: 15, errors: {
            max: (val, max) => `Number cannot be above ${max}`,
            min: (val, min) => `Number cannot be below ${min}`
        } }
    }
});

// Warmup
resultObjvl({});

const before1 = performance.now();
for (let i=0; i < 100000; i++) {
    resultObjvl({
        name: "Google",
        value: "abc",
        age: i
    });
}
console.log(`OBJVL: ${performance.now() - before1} ms.`);

const before = performance.now();
for (let i=0; i < 100000; i++) {
    resultAjv({
        name: "Google",
        value: "abc",
        age: i
    });
}
console.log(`AJV: ${performance.now() - before} ms.`);
