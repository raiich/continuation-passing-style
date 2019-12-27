import {Continuation, Expression, Interpreter, repl} from './util'

class Free<A, R> {
    constructor(readonly v: A) {}

    public fmap<B>(f: (a: A) => Free<B, R>): Free<B, R> {
        return f(this.v)
    }
}

type Func = (args: Array<number>) => Free<number, void>

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
function evalExpression(s: Expression): Free<number | Func, void> {
    if (s instanceof Array) { // function call
        const [head, ...tail] = s
        return evalExpression(head).fmap((method) => {
            return evalArgs(tail).fmap((args) => {
                const func = method as Func
                return func(args).fmap((result: number) => {
                    return new Free(result)
                })
            })
        })
    } else if (s === '+') {
        return new Free(plus)
    } else {
        return new Free(parseInt(s))
    }
}

function evalArgs(args: Expression): Free<Array<number>, void> {
    if (args.length > 0) {
        const [head, ...tail] = args
        return evalExpression(head).fmap((evaluated) => {
            return evalArgs(tail).fmap((evaluatedArgs) => {
                return new Free<Array<number>, void>([evaluated as number, ...evaluatedArgs])
            })
        })
    } else {
        return new Free([])
    }
}

function plus(args: Array<number>): Free<number, void> {
    return new Free(args.reduce((total, x) => total + x))
}

class CurrentInterpreter implements Interpreter {
    evaluate(expression: Expression, callback: Continuation): void {
        evalExpression(expression).fmap(result => new Free(callback(result)))
    }
}

repl(new CurrentInterpreter())
