import {Continuation, Expression, Interpreter, repl} from './util'

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
 * @param cont continuation
 */
function evalExpression(s: Expression, cont: Continuation) {
    if (s instanceof Array) { // function call
        const [head, ...tail] = s
        evalExpression(head, (method) => {
            evalArgs(tail, (args) => {
                method(args, cont)
            })
        })
    } else if (s === '+') {
        cont(plus)
    } else {
        cont(parseInt(s))
    }
}

function evalArgs(args: Expression, cont: Continuation) {
    if (args.length > 0) {
        const [head, ...tail] = args
        evalExpression(head, (evaluated) => {
            evalArgs(tail, (evaluatedArgs) => {
                cont([evaluated, ...evaluatedArgs])
            })
        })
    } else {
        cont([])
    }
}

function plus(args: Array<number>, cont: Continuation) {
    cont(args.reduce((total, x) => total + x))
}

class BasicInterpreter implements Interpreter {
    evaluate(expression: Expression, callback: Continuation): void {
        evalExpression(expression, callback)
    }
}

repl(new BasicInterpreter())
