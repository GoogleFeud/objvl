
export const enum ParseState {
    Params,
    Exp
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function inlineFunc(fn: string|Function, replacements: Array<string>) : string {
    if (typeof fn === "function") fn = fn.toString();
    if (fn.startsWith("function")) return `(${fn})(${replacements.join(",")})`;
    fn += " ";
    const fnLen = fn.length;
    let res = "";
    // The current token
    let current = "";
    // If the parser is currently in a string
    let inStr = false;
    // The state the parser is in - whether it's reading parameters or the expresion itself
    let state = ParseState.Params;
    // The function params
    const params: string[] = [];

    let isPrevArrow = false;
    for (let i=0; i < fnLen + 1; i++) {
        const char = fn[i];

        // If the next token is => and the state is params, transition to the other state
        if (char === "=" && fn[i + 1] === ">" && state === ParseState.Params) {
            state = ParseState.Exp;
            isPrevArrow = true;
            // Skip over the =>
            i++;
            continue;
        }

        // Cancel the optimization if the function has multiple expressions
        if (isPrevArrow && char === "{") return `(${fn})(${replacements.join(",")})`;

        // Toggle string mode
        if (char === "\"") inStr = !inStr;

        // If the current character is valid in an identifier, add it to the current identifier
        if (/[a-zA-Z0-9_]/.test(char) && !inStr) {
            current += char;
            continue;
        }

        // If not...
        if (state === ParseState.Params && current) params.push(current);
        else {
            const param = params.indexOf(current);
            if (param !== -1) res += replacements[param];
            else res += current;
        }
        current = "";

        if (char) {
            if (inStr) res += char;
            else {
                if (state !== ParseState.Params && (char !== " " && char !== "\n" && char !== ";")) {
                    res += char;
                    isPrevArrow = false;
                }
            }
        }

    }
    return res;
}