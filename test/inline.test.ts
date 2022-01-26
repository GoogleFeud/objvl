
import { inlineFunc } from "../src/compiler/inliner";

test("Inline Function: simple inlining", () => {
    expect(inlineFunc((a: number, b: number) => a + b, ["5", "5"])).toBe("5+5");
});

test("Inline Function: complex inlining", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(inlineFunc((a: any, b: any) => a.edit(b).parse("a").parse("b"), ["c", "d"])).toBe("c.edit(d).parse(\"a\").parse(\"b\")");
});

test("Inline Function: failed inlining", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(inlineFunc((a: any, b: any) => {console.log(a + b); }, ["c", "d"])).toBe("((a, b) => { console.log(a + b); } )(c,d)");
});

