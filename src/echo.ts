import {Continuation, Expression, Interpreter, repl} from './util'

class EchoInterpreter implements Interpreter {
    evaluate(expression: Expression, callback: Continuation): void {
        console.log(expression)
        callback(undefined)
    }
}

repl(new EchoInterpreter())
