import { inlineFunc } from "./inliner";


/**
 * A utility class which generates javascript code.
 */
export class CodeCreator {
    code: string;
    constructor() {
        this.code = "";
    }

    if(condition: string, inside: string) : void {
        this.code += `if (${condition}) ${inside}`;
    }

    elseIf(condition: string, inside: string) : void {
        this.code += `else if (${condition}) ${inside}`;
    }

    and(a: string, b: string) : void {
        this.code += `(${a} && ${b})`;
    }

    or(a: string, b: string) : void {
        this.code += `(${a} || ${b})`;
    }

    // eslint-disable-next-line @typescript-eslint/ban-types
    inline(func: Function|string, replacements: Array<string>) : void {
        this.code += inlineFunc(func, replacements);
    }
    
}