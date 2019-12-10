import * as readline from 'readline'

export type Expression = string | Compound
export type Compound = Array<string | Expression>
export type Continuation = (evaluated: any) => void

export interface Interpreter {
    evaluate(expression: Expression, callback: Continuation): void
}

interface StackFrame {
    frame: Compound
    parent: StackFrame | undefined
}

export function repl(interpreter: Interpreter) {
    const baseStackFrame: StackFrame = {
        frame: [],
        parent: undefined,
    }
    let stack = baseStackFrame

    const reader = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })

    process.stdout.write('> ')
    reader.on('line', (line) => {
        stack = parse(stack, line)
        if (stack === baseStackFrame) {
            interpreter.evaluate(stack.frame[0], (evaluated) => {
                if (evaluated) {
                    process.stdout.write(`${evaluated}`)
                    process.stdout.write('\n')
                }
                process.stdout.write('> ')
            })
            stack.frame.length = 0 // clear
        } else {
            process.stdout.write('. ')
        }
    })

    process.stdin.on('end', () => {
        // pass
    })
}


function parse(stack: StackFrame, line: string) {
    let token = ''
    for (let i = 0; i < line.length; i++) {
        const c = line.charAt(i)
        if (c === '(') {
            pushToken()
            const newFrame: Expression = []
            stack.frame.push(newFrame)
            stack = {
                frame: newFrame,
                parent: stack,
            }
        } else if (c === ')') {
            pushToken()
            stack = stack.parent!
        } else if (c === ' ') {
            pushToken()
        } else {
            token += c
        }
    }
    pushToken()
    return stack

    function pushToken() {
        if (token) {
            stack.frame.push(token)
            token = ''
        }
    }
}
