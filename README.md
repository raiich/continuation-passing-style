# continuation-passing-style

Simple code example of continuation passing style, evaluating simple S-expression calculation, using JavaScript.

This can only calculate sum of numbers (only `+`).
The sample implementation is as below:

- Basic continuation passing style implementation
    - takes continuation as one of function parameters
- Curried version
    - continuation parameter is curried
- using Continuation Monad version
    - curried parameter is replaced with continuation monad

## Execute Basic Continuation Passing style implementation

```bash
$ yarn build ; yarn run:basic
```

Execution Example:

```bash
> (+ 1 (+ 2 3))
6
```

## Execute Curried version

```bash
$ yarn build ; yarn run:curried
```

## Execute Monadic version

```bash
$ yarn build ; yarn run:monadic
```
