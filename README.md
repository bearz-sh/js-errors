# Bearz-Sh Errors

Provides a set of custom errors and functions for working with errors.

The base class for all errors is `SystemError`. It provides a set of properties
for working with errors. It also provides a set of static methods for working
with errors.

The `SystemError` class provides the common properties:

- `data` - A dictionary of additional data associated with the error.
- `innerError` - The inner error that caused this error. This is different than `cause` in that it is always an error or
  undefined.
- `link` - A link to documentation about this error.
- `stackTrace` - The stack trace for this as an array of strings, one for each frame.

The `ArgumentError` class is a specialization of `SystemError` that is used to indicate
that an argument to a function is invalid and provides a base class for more specific
argument errors.

There are static throw methods on `SystemError` and `ArgumentError` that can be used to
throw an error.

There is an experimental `@hideFromStackTrace` decorator method which will hide a method
on the class from the stackTrace property.

## Deno

```ts
// deno
import { ArgumentNullError } from "https://deno.land/x/bearzsh_errors@MOD_VERSION/mod.ts";

function example(name: string | null) {
    ArgumentNullError.throw(name, "name");
    console.log(name);
}

example(null); // throws
example("test"); // prints "test"
example(undefined); // throws

// of course the error can be thrown normally with
throw new ArgumentNullError("name", "name must not be null.");
```

## Node

```ts
// deno
import { ArgumentNullError } from "@bearz-sh/errors";

function example(name: string | null) {
    ArgumentNullError.throw(name, "name");
    console.log(name);
}

example(null); // throws
example("test"); // prints "test"
example(undefined); // throws

// of course the error can be thrown normally with
throw new ArgumentNullError("name", "name must not be null.");
```

## Errors

- SystemError
- ArgumentError
- ArgumentNullError
- ArgumentEmptyError
- ArgumentRangeError
- AssertionError
- FormatError
- InvalidCastError
- InvalidOperationError
- PlatformNotSupportedError
- NotSupportedError
- NotImplementedError
- NullReferenceError
- ObjectDisposedError
- TimeoutError
- Win32Error

## License

MIT
