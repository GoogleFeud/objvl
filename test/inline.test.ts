
import { inlineFunc } from "../src/compiler/inliner";

test("Simple inlining", () => {
    expect(inlineFunc((a: number, b: number) => a + b, ["5", "5"])).toBe("5+5");
});

test("Complex inlining", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(inlineFunc((a: any, b: any) => a.edit(b).parse("a").parse("b"), ["c", "d"])).toBe("c.edit(d).parse(\"a\").parse(\"b\")");
});

test("Failed inlining", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(inlineFunc((a: any, b: any) => {console.log(a + b); }, ["c", "d"])).toBe("((a, b) => { console.log(a + b); } )(c,d)");
});

test("Zero param inlining", () => {
    expect(inlineFunc(() => 505, [])).toBe("505");
});