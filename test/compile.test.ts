
import { compile } from "../dist";

test("paths in errors", () => {
    const validator = compile({
        properties: {
            number: { type: "integer", errors: {
                type: (value, depth) => (expect(depth).toBe("number"), "Property 'number' must be an integer.")
            }},
            obj1: {
                type: "object",
                properties: {
                    obj2: {
                        type: "object",
                        properties: {
                            nested: { type: "integer", errors: {
                                type: (value, depth) => (expect(depth).toBe("obj1/obj2/nested"), "Property 'number' must be an integer.")
                            }}
                        }
                    }
                }
            }
        }
    });

    validator({
        number: "abc",
        obj1: { obj2: { nested: "cde" } }
    });
    
});