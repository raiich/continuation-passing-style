import {Continuation, Expression, Interpreter, repl} from './util'

class Cont<A, R> {
    constructor(readonly callback: (c: (evaluated: A) => R) => R) {}

    public fmap<B>(f: (a: A) => Cont<B, R>): Cont<B, R> {
        return new Cont<B, R>(nextCont => {
            return this.callback((x: any) => {
                return f(x).callback(nextCont)
            })
        })
    }
}

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
function evalExpression(s: Expression): Cont<any, any> {
    if (s instanceof Array) { // function call
        const [head, ...tail] = s
        return evalExpression(head).fmap((method) => {
            return evalArgs(tail).fmap((args) => {
                return method(args).fmap((result: any) => {
                    return new Cont((cont) => cont(result))
                })
            })
        })
    } else if (s === '+') {
        return new Cont((cont) => cont(plus))
    } else {
        return new Cont((cont) => cont(parseInt(s)))
    }
}

function evalArgs(args: Expression): Cont<any, any> {
    if (args.length > 0) {
        const [head, ...tail] = args
        return evalExpression(head).fmap((evaluated) => {
            return evalArgs(tail).fmap((evaluatedArgs) => {
                return new Cont<any, any>((cont) => cont([evaluated, ...evaluatedArgs]))
            })
        })
    } else {
        return new Cont((cont) => cont([]))
    }
}

function plus(args: Array<number>) {
    return new Cont((cont) => {
        cont(args.reduce((total, x) => total + x))
    })
}

class CurrentInterpreter implements Interpreter {
    evaluate(expression: Expression, callback: Continuation): void {
        evalExpression(expression).callback(x => callback(x))
    }
}

repl(new CurrentInterpreter())
