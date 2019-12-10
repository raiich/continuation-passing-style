import {Compound, Continuation, Expression, Interpreter, repl} from './util'

/**
 * 1. Evaluate function:
 *   |f| => f
 * 2. Evaluate args one by one:
 *   [|a|, |b|, ...]
 *   => [a], [|b|, ...]
 *   => [a, b] [...]
 * 3. Call function with evaluated args
 *
 * @param s statement (S-Expression)
 */
function evalExpression(s: Expression) {
    if (s instanceof Array) { // function call
        const [head, ...tail] = s
        return (cont: Continuation) => {
            evalExpression(head)((method: (nums: Array<number>) => (cont: Continuation) => void) => {
                evalArgs(tail)((args: Array<number>) => {
                    method(args)(cont)
                })
            })
        }
    } else if (s === '+') {
        return (cont: Continuation) => cont(plus)
    } else {
        return (cont: Continuation) => cont(parseInt(s))
    }
}

function evalArgs(args: Compound) {
    if (args.length > 0) {
        const [head, ...tail] = args
        return (cont: Continuation) => {
            evalExpression(head)((evaluated: number) => {
                evalArgs(tail)((evaluatedArgs: Array<number>) => {
                    cont([evaluated, ...evaluatedArgs])
                })
            })
        }
    } else {
        return (cont: Continuation) => cont([])
    }
}

function plus(args: Array<number>) {
    return (cont: Continuation) => {
        cont(args.reduce((total, x) => total + x))
    }
}

class MyInterpreter implements Interpreter {
    evaluate(expression: Expression, callback: Continuation): void {
        evalExpression(expression)(callback)
    }
}

repl(new MyInterpreter())
