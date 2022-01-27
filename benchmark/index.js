/* eslint-disable */

const Ajv = require("ajv");
const { Objvl } = require("../dist/compiler");
const Joi = require("joi");
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
    b.complete(),
    b.save({ file: 'compilation', format: 'chart.html' })
)

const ajv = new Ajv({allErrors: true});
const resultAjv = ajv.compile({
    type: "object",
    properties: {
        name: { type: "string", minLength: 15 },
        age: { type: "integer", minimum: 13, maximum: 99 },
        hobbies: { type: "array", contains: { type: "string", minLength: 5 } },
        users: {
            type: "array",
            contains: {
                type: "object",
                properties: {
                    name: { type: "string", minLength: 15 },
                    age: { type: "integer", minimum: 13, maximum: 99 },
                },
                required: ["name", "age"]
            }
        }
    },
    required: ["name", "age","users"]
});

const resultObjvl = Objvl.compile({
    properties: {
        name: { type: "string", maxLen: 15, errors: {
            maxLen: () => { return "String length exceeded." }
        }},
        age: { type: "integer", min: 13, max: 99, errors: {
            max: (val, max) => `Age exceeded. Max age is ${max}`,
            min: (val, min) => `Age must be bigger than ${min}.`
        }},
        hobbies: { 
            type: "array",
            optional: true,
            items: { type: "string", minLen: 5, errors: {} },
            errors: {
                minLen: (val, min) => `Hobbies must contain more than ${min} characters.`
            }
        },
        users: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    name: { type: "string", maxLen: 15, errors: {
                        maxLen: () => { return "String length exceeded." }
                    }},
                    age: { type: "integer", min: 13, max: 99, errors: {
                        max: (val, max) => `Age exceeded. Max age is ${max}`,
                        min: (val, min) => `Age must be bigger than ${min}.`
                    }},
                }
            }
        }
    }
});

const joi = Joi.object({
    name: Joi.string().max(15),
    age: Joi.number().integer().min(13).max(99),
    hobbies: Joi.array().items(Joi.string().min(5)),
    users: Joi.array().items(Joi.object({
        name: Joi.string().max(15),
        age: Joi.number().integer().min(13).max(99)
    }))
});

console.log(resultObjvl.toString());
console.log(resultAjv.toString());

b.suite("Validation",
    b.add("Objvl", () => {
        const res = resultObjvl({
            name: "abcccccccccccccccccccccccccccccccccccc",
            age: 314,
            hobbies: ["developer", "dev", "video games", "books", "watching movies", "idk"],
            users: [
                { name: "Google", age: 44 },
                { name: "B", age: 355 },
                { name: "Ccwedw3ewe2e2e3eed3e3dde3e3s3d3d3", age: 43545 },
                { name: "C", age: 44 }
            ]   
        });
    }),
    b.add("Ajv", () => {
        const res = resultAjv({
            name: "abcccccccccccccccccccccccccccccccccccc",
            value: 314,
            hobbies: ["developer", "dev", "video games", "books", "watching movies", "idk"],
            users: [
                { name: "Google", age: 44 },
                { name: "B", age: 355 },
                { name: "Ccwedw3ewe2e2e3eed3e3dde3e3s3d3d3", age: 43545 },
                { name: "C", age: 44 }
            ]
        });
    }),
    b.add("Joi", () => {
        const res = joi.validate({
            name: "abcccccccccccccccccccccccccccccccccccc",
            value: 314,
            hobbies: ["developer", "dev", "video games", "books", "watching movies", "idk"],
            users: [
                { name: "Google", age: 44 },
                { name: "B", age: 355 },
                { name: "Ccwedw3ewe2e2e3eed3e3dde3e3s3d3d3", age: 43545 },
                { name: "C", age: 44 }
            ]
        })
    }),
    b.cycle(),
    b.complete(),
    b.save({ file: 'validation', format: 'chart.html' })
)