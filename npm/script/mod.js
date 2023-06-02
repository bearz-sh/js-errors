"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _SystemError_stackLines;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormatError = exports.NullReferenceError = exports.InvalidCastError = exports.InvalidOperationError = exports.PlatformNotSupportedError = exports.NotImplementedError = exports.ObjectDisposedError = exports.NotSupportedError = exports.TimeoutError = exports.AssertionError = exports.ArgumentRangeError = exports.ArgumentNullError = exports.ArgumentEmptyError = exports.ArgumentError = exports.Win32Error = exports.SystemError = exports.hideFromStackTrace = exports.printError = exports.walkError = exports.collectError = exports.getStackTrace = void 0;
/**
 * Bearz-sh error module
 *
 * Provides a set of classes and functions for working with errors.
 *
 * The base class for all errors is `SystemError`. It provides a set of
 * properties for working with errors. It also provides a set of static
 * methods for working with errors.
 *
 * The `ArgumentError` class is a specialization of `SystemError` that
 * is used to indicate that an argument to a function is invalid and provides
 * a base class for more specific argument errors.
 *
 * There are static throw methods on `SystemError` and `ArgumentError` that
 * can be used to throw an error.
 *
 * The `SystemError` class provides the common properties:
 *
 * - `data` - A dictionary of additional data associated with the error.
 * - `innerError` - The inner error that caused this error. This is different than
 *    `cause` in that it is always an error or undefined.
 * - `link` - A link to documentation about this error.
 * - `stackTrace` - The stack trace for this as an array of strings, one for each frame.
 *
 * @example
 *
 * ```ts
 * import { ArgumentNullError } from "https://deno.land/x/bearzsh_errors@MOD_VERSION/mod.ts";
 *
 * function example(name: string | null) {
 *     ArgumentNullError.throw(name, "name");
 *
 *     console.log(name);
 * }
 *
 * example(null); // throws
 * example("test"); // prints "test"
 * example(undefined); // throws
 *
 * ```
 *
 * @module
 */
require("./_dnt.polyfills.js");
const dntShim = __importStar(require("./_dnt.shims.js"));
/**
 * Gets the stack trace for the given error. If the error does not have a stack trace,
 * it will return an empty array.
 *
 * @param e The error to get the stack trace for.
 * @returns A string array of the stack trace for each frame.
 */
function getStackTrace(e) {
    if (e.stack) {
        return e.stack.split("\n").map((line) => line.trim()).filter((o) => o.startsWith("at "));
    }
    return [];
}
exports.getStackTrace = getStackTrace;
/**
 * Collects all errors from the given error tree and returns them as an array.
 */
function collectError(e) {
    const errors = [];
    walkError(e, (error) => errors.push(error));
    return errors;
}
exports.collectError = collectError;
/**
 * Walks the error tree and invokes the callback for each error. It will
 * walk the inner error, cause, and aggregate errors if they are an instance
 * of `Error`.
 *
 * @param e The error to walk.
 * @param callback The callback to invoke for each error.
 */
function walkError(e, callback) {
    if (e instanceof AggregateError && e.errors) {
        for (const error of e.errors) {
            if (error instanceof Error) {
                walkError(error, callback);
            }
        }
    }
    if (e instanceof SystemError && e.innerError) {
        walkError(e.innerError, callback);
    }
    if (e.cause !== undefined && e.cause !== null && e.cause instanceof Error) {
        walkError(e.cause, callback);
    }
    callback(e);
}
exports.walkError = walkError;
/**
 * Prints the error to the console and if an error derives from SystemError,
 * it will print the inner error as well.
 *
 * @param e The error to print to the console.
 * @param format Formats the error to the console.
 * @param write A function that overrides the default behavor of writing to console.error.
 */
// deno-lint-ignore no-explicit-any
function printError(e, format, write) {
    write = write || console.error;
    if (e instanceof AggregateError && e.errors) {
        for (const error of e.errors) {
            printError(error, format, write);
        }
    }
    if (e instanceof SystemError && e.innerError) {
        printError(e.innerError, format, write);
    }
    if (e.cause !== undefined && e.cause !== null) {
        if (e.cause instanceof Error) {
            printError(e.cause, format, write);
        }
        else {
            write(e.cause);
        }
    }
    if (format) {
        write(format(e));
        return;
    }
    write(e);
}
exports.printError = printError;
function getPlatform() {
    // deno-lint-ignore no-explicit-any
    const g = dntShim.dntGlobalThis;
    if (g && g.Deno && g.Deno.build) {
        return g.Deno.build.os;
    }
    if (g && g.process && g.process.platform) {
        const os = g.process.platform;
        if (os === "win32") {
            return "windows";
        }
    }
    if (g && g.navigator) {
        if (g.navigator.userAgentData) {
            return g.navigator.userAgentData.platform.toLowerCase();
        }
        if (g.navigator.platform) {
            const parts = g.navigator.platform.split(" ");
            if (parts.length > 0) {
                return parts[0].toLowerCase();
            }
        }
    }
    return "unknown";
}
/**
 * A decorator for hiding a function from the stack trace.
 *
 * @experimental This is experimental and may change or be removed in a future release.
 */
function hideFromStackTrace() {
    // deno-lint-ignore no-explicit-any
    return function (target, _propertyKey, descriptor) {
        const original = descriptor.value;
        if (typeof original === "function") {
            descriptor.value = (...args) => {
                try {
                    return original.apply(target, args);
                }
                catch (e) {
                    if (e instanceof Error && e.stack) {
                        // first line of stack trace is the message, though could be multiple lines
                        // if the dev used '\n' in the error message.
                        // todo: figure out messages can exceed the first line.
                        const lines = e.stack.split("\n");
                        const line = lines.filter((o) => o.includes(original.name));
                        if (!line || line.length === 0) {
                            throw e;
                        }
                        const start = lines.indexOf(line[0]);
                        if (start > -1) {
                            lines.splice(start, 2);
                            e.stack = lines.join("\n");
                        }
                        throw e;
                    }
                }
            };
        }
        return descriptor;
    };
}
exports.hideFromStackTrace = hideFromStackTrace;
/**
 * The core error type for system errors such
 * as `ArgumentError`, `FormatError` and `ArgumentNullError`.
 */
class SystemError extends Error {
    /**
     * Creates a new instance of SystemError.
     *
     * @param message The message for the error.
     * @param options The property values to set on the error.
     */
    constructor(message, options) {
        super(message);
        _SystemError_stackLines.set(this, void 0);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "SystemError"
        });
        /**
         * Gets or sets the inner error that caused this error, if any.
         */
        Object.defineProperty(this, "innerError", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * Gets or sets additional data associated with this error.
         */
        Object.defineProperty(this, "data", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * Gets or sets a link to documentation about this error.
         */
        Object.defineProperty(this, "link", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.set(options);
    }
    /**
     * Sets the properties of this error from the given object.
     *
     * @param props The properties to set.
     * @returns This error.
     */
    set(props) {
        if (props === undefined) {
            return this;
        }
        for (const [key, value] of Object.entries(props)) {
            if (key === "name" || key === "stack") {
                continue;
            }
            if (Object.hasOwn(this, key)) {
                // @ts-ignore. between the Partial and Object.hasOwn, this is a valid property
                this[key] = value;
            }
        }
        return this;
    }
    /**
     * Sets the stack for this error.
     */
    set stack(value) {
        __classPrivateFieldSet(this, _SystemError_stackLines, undefined, "f");
        super.stack = value;
    }
    /**
     * Gets the stack trace for this error as an array of strings that
     * represent each line of the stack.
     *
     * @returns The stack trace for this error.
     */
    get stackTrace() {
        if (!__classPrivateFieldGet(this, _SystemError_stackLines, "f")) {
            if (this.stack) {
                __classPrivateFieldSet(this, _SystemError_stackLines, this.stack.split("\n").map((line) => line.trim()).filter((o) => o.startsWith("at ")), "f");
            }
            else {
                __classPrivateFieldSet(this, _SystemError_stackLines, [], "f");
            }
        }
        return __classPrivateFieldGet(this, _SystemError_stackLines, "f");
    }
    /**
     * Sets the stack trace for this error.
     */
    set stackTrace(value) {
        __classPrivateFieldSet(this, _SystemError_stackLines, value, "f");
        super.stack = value.join("\n");
    }
}
exports.SystemError = SystemError;
_SystemError_stackLines = new WeakMap();
const win32Docs = "https://github.com/MicrosoftDocs/win32/blob/docs/desktop-src/Debug/system-error-codes.md";
/**
 * An error that represents an Win32 error that contains a system error code. This is for
 * Foreign Function Interface (FFI) calls that return a Win32 error code.
 *
 * The default message is "Win32 error ${code}. See ${code} for more information using ${win32Docs}."
 */
class Win32Error extends SystemError {
    /**
     * Initializes a new instance of the Win32Error class.
     *
     * @param code The windows system error code.
     * @param message The message for the error.
     * @param options The property values to set on the error.
     */
    constructor(code, message, options) {
        super(message || `Win32 error ${code}. See ${code} for more information using ${win32Docs}.`, options);
        Object.defineProperty(this, "code", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: code
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "Win32Error"
        });
        this.link = win32Docs;
    }
    static throw(code, message, options) {
        throw new Win32Error(code, message, options);
    }
}
exports.Win32Error = Win32Error;
/**
 * An error for arguments that are invalid.
 *
 * The default message is "Argument ${parameterName} is invalid."
 */
class ArgumentError extends SystemError {
    /**
     * Initializes a new instance of the ArgumentError class.
     *
     * @param parameterName The name of the parameter that is invalid.
     * @param message The message for the error.
     * @param options The property values to set on the error.
     */
    constructor(parameterName, message, options) {
        super(message || `Argument ${parameterName} is invalid.`, options);
        /**
         * Gets or sets the name of the parameter that is invalid.
         */
        Object.defineProperty(this, "parameterName", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "ArgumentError"
        });
        this.parameterName = parameterName;
    }
    /**
     * Throws an ArgumentError if the expression is true.
     * @param expression The expression to evaluate to throw when true.
     * @param parameterName The name of the parameter that is invalid.
     * @param message The message for the error.
     * @param options The property values to set on the error.
     *
     * @throws {ArgumentError} Thrown when the expression is false.
     */
    static throwIf(expression, parameterName, message, options) {
        if (expression) {
            throw new ArgumentError(parameterName, message, options);
        }
    }
}
exports.ArgumentError = ArgumentError;
/**
 * An error for when an argument is null, undefined, or empty.
 *
 * The default message is "Argument ${parameterName} must not be null, undefined, or empty."
 */
class ArgumentEmptyError extends ArgumentError {
    /**
     * Initializes a new instance of the ArgumentEmptyError class.
     *
     * @param parameterName The name of the parameter that is invalid.
     * @param message The message for the error.
     * @param options The property values to set on the error.
     *
     * @example
     * ```typescript
     * import { ArgumentEmptyError } from 'https://deno.land/x/bearzsh_errrors@MOD_VERSION/mod.ts';
     *
     * function doSomething<T>(value?: ArrayLike<T> | null) {
     *      ArgumentEmptyError.throw(value, 'value');
     * }
     *
     * doSomething(null); // throws ArgumentEmptyError
     * doSomething(undefined); // throws ArgumentEmptyError
     * doSomething(''); // throws ArgumentEmptyError
     * doSomething([]); // throws ArgumentEmptyError
     * ```
     */
    constructor(parameterName, message, options) {
        super(parameterName, message || `Argument ${parameterName} must not be null, undefined, or empty.`, options);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "ArgumentEmptyError"
        });
    }
    /**
     * Throws an ArgumentEmptyError if the value is null, undefined, or empty.
     *
     * @param value The value to check if it is null, undefined, or empty.
     * @param parameterName The name of the parameter that is invalid.
     * @param message Ths message for the error.
     * @param options The property values to set on the error.
     */
    static throw(value, parameterName, message, options) {
        if (value === null || value === undefined) {
            throw new ArgumentEmptyError(parameterName, message, options);
        }
        if (value.length === 0) {
            throw new ArgumentEmptyError(parameterName, message, options);
        }
    }
    /**
     * Throws an ArgumentEmptyError if the expression is true.
     *
     * @param expression The expression to evaluate to throw when true.
     * @param parameterName The name of the parameter that is invalid.
     * @param message The message for the error.
     * @param options The property values to set on the error.
     */
    static throwIf(expression, parameterName, message, options) {
        if (expression) {
            throw new ArgumentEmptyError(parameterName, message, options);
        }
    }
}
exports.ArgumentEmptyError = ArgumentEmptyError;
/**
 * An error that for arguments that are null or undefined.
 *
 * The default message is "Argument ${parameterName} must not be null or undefined."
 */
class ArgumentNullError extends ArgumentError {
    /**
     * Initializes a new instance of the ArgumentNullError class.
     *
     * @param parameterName The name of the parameter that is invalid.
     * @param message The message for the error.
     * @param innerError This inner error.
     */
    constructor(parameterName, message, options) {
        super(parameterName, message || `Argument ${parameterName} must not be null or undefined.`, options);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "ArgumentNullError"
        });
    }
    /**
     * Throws an ArgumentNullError if the value is null or undefined.
     *
     * @param value The value to check if it is null or undefined.
     * @param parameterName The name of the parameter that is invalid.
     * @param message The message for the error.
     * @param innerError This inner error.
     */
    static throw(value, parameterName, message, options) {
        if (value === null || value === undefined) {
            throw new ArgumentNullError(parameterName, message, options);
        }
    }
    /**
     * Throws an ArgumentNullError if the expression is true.
     *
     * @param expression The expression to evaluate to throw when true.
     * @param parameterName The name of the parameter that is invalid.
     * @param message The message for the error.
     * @param options The property values to set on the error.
     */
    static throwIf(expression, parameterName, message, options) {
        if (expression) {
            throw new ArgumentNullError(parameterName, message, options);
        }
    }
}
exports.ArgumentNullError = ArgumentNullError;
/**
 * An error for when arguments are out of range such as length or indexes.
 *
 * The default message is "Argument ${parameterName} is out of range."
 */
class ArgumentRangeError extends ArgumentError {
    /**
     * Initializes a new instance of the ArgumentRangeError class.
     *
     * @param value This value that is out of range.
     * @param parameterName This name of the parameter that is invalid.
     * @param message This message for the error.
     * @param innerError This inner error.
     */
    constructor(value, parameterName, message, options) {
        super(parameterName, message || `Argument ${parameterName} is out of range.`, options);
        Object.defineProperty(this, "value", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "ArgumentRangeError"
        });
        this.value = value;
    }
    /**
     * Throws an ArgumentRangeError error.
     *
     * @param value The value to check if it is out of range.
     * @param parameterName The name of the parameter that is invalid.
     * @param message The message for the error.
     * @param innerError This inner error.
     */
    static throw(value, parameterName, message, options) {
        throw new ArgumentRangeError(value, parameterName, message, options);
    }
    /**
     * Throws an ArgumentRangeError if the expression is true.
     *
     * @param expression The expression to evaluate to throw when false.
     * @param parameterName The name of the parameter that is invalid.
     * @param message This message for the error.
     * @param innerError This inner error.
     */
    static throwIf(expression, parameterName, message, options) {
        if (expression) {
            throw new ArgumentRangeError(undefined, parameterName, message, options);
        }
    }
}
exports.ArgumentRangeError = ArgumentRangeError;
/**
 * An error for failed assertions.
 *
 * The default message is "Assertion failed."
 */
class AssertionError extends SystemError {
    /**
     * Initializes a new instance of the AssertionError class.
     *
     * @param message This message for the error.
     * @param innerError This inner error.
     */
    constructor(message, options) {
        super(message || "Assertion failed.", options);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "AssertionError"
        });
    }
    static throw(message, options) {
        throw new AssertionError(message, options);
    }
    /**
     * Throws an AssertionError error.
     *
     * @param expression This expression to evaluate to throw when false.
     * @param message This message for the error.
     * @param innerError This inner error.
     */
    static throwIf(expression, message, options) {
        if (expression) {
            throw new AssertionError(message, options);
        }
    }
}
exports.AssertionError = AssertionError;
/**
 * An error for when an operation times out.
 *
 * The default message is "Operation timed out."
 */
class TimeoutError extends SystemError {
    /**
     * Initializes a new instance of the TimeoutError class.
     *
     * @param message The message for the error.
     * @param innerError This inner error.
     */
    constructor(message, options) {
        super(message || "Operation timed out.", options);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "TimeoutError"
        });
    }
    /**
     * throw a TimeoutError error.
     *
     * @param message The message for the error.
     * @param innerError This inner error.
     */
    static throw(message, options) {
        throw new TimeoutError(message, options);
    }
    /**
     * Throws a TimeoutError if the condition is true.
     *
     * @param condition The condition to evaluate to throw when true.
     * @param message The message for the error.
     * @param innerError This inner error.
     */
    static throwIf(condition, message, options) {
        if (condition) {
            throw new TimeoutError(message, options);
        }
    }
}
exports.TimeoutError = TimeoutError;
/**
 * An error for when a function, method, property, or subroutine
 * general action, enum, or case is not supported.
 *
 * The default message is "Operation is not supported."
 */
class NotSupportedError extends SystemError {
    /**
     * Initializes a new instance of the NotSupportedError class.
     *
     * @param message The message for the error.
     * @param options The property values to set on the error.
     */
    constructor(message, options) {
        super(message || "Operation is not supported.", options);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "NotSupportedError"
        });
    }
    /**
     * Throws a NotSupportedError error.
     *
     * @param message The message for the error.
     * @param innerError This inner error.
     */
    static throw(message, options) {
        throw new NotSupportedError(message, options);
    }
    /**
     * @param condition The condition to evaluate to throw when true.
     * @param message
     * @param innerError
     */
    static throwIf(condition, message, options) {
        if (condition) {
            throw new NotSupportedError(message, options);
        }
    }
}
exports.NotSupportedError = NotSupportedError;
/**
 * An error for when an object has disposed of resources and can
 * no longer be used.
 *
 * The default message is "Object is disposed."
 */
class ObjectDisposedError extends SystemError {
    constructor(message, options) {
        super(message || "Object is disposed.", options);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "ObjectDisposedError"
        });
    }
    static throw(message, options) {
        throw new ObjectDisposedError(message, options);
    }
    static throwIf(condition, message, options) {
        if (condition) {
            throw new ObjectDisposedError(message, options);
        }
    }
}
exports.ObjectDisposedError = ObjectDisposedError;
/**
 * An error for when a function, method, property, case,
 * or a subroutine is not implemented.
 *
 * The default message is "Not implemented."
 */
class NotImplementedError extends SystemError {
    /**
     * Initializes a new instance of the NotImplementedError class.
     * @param message The message for the error.
     * @param options The property values to set on the error.
     */
    constructor(message, options) {
        super(message || "Not implemented.", options);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "NotImplementedError"
        });
    }
    /**
     * Throws a NotImplementedError error.
     *
     * @param message The message for the error.
     * @param options The property values to set on the error.
     */
    static throw(message, options) {
        throw new NotImplementedError(message, options);
    }
    /**
     * Throws a NotImplementedError if the condition is true.
     *
     * @param condition The condition to evaluate to throw when true.
     * @param message The message for the error.
     * @param options The property values to set on the error.
     */
    static throwIf(condition, message, options) {
        if (condition) {
            throw new NotImplementedError(message, options);
        }
    }
}
exports.NotImplementedError = NotImplementedError;
/**
 * An error for when a platform such as an operating system is not supported.
 *
 * The default message is "Platform is not supported."
 */
class PlatformNotSupportedError extends SystemError {
    /**
     * Initializes a new instance of the PlatformNotSupportedError class.
     *
     * @param message The message for the error.
     * @param options The property values to set on the error.
     */
    constructor(message, options) {
        super(message || "Platform is not supported.", options);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "PlatformNotSupportedError"
        });
    }
    /**
     * Gets the current platform.
     */
    static get platform() {
        return getPlatform();
    }
    /**
     * Throws a PlatformNotSupportedError error.
     *
     * @param message The message for the error.
     * @param options The property values to set on the error.
     */
    static throw(message, options) {
        throw new PlatformNotSupportedError(message, options);
    }
    /**
     * Throws if the condition is true.
     *
     * @param condition The condition to evaluate to throw when true.
     * @param message The message for the error.
     * @param options The property values to set on the error.
     */
    static throwIf(condition, message, options) {
        if (condition) {
            throw new PlatformNotSupportedError(message, options);
        }
    }
    /**
     * Throws when a platform doesn't match the current os provided by the runtime.
     *
     * @param os The operating system to check.
     * @param message The message to
     * @param options The property values to set on the error.
     */
    static throwWhenOsNotSupported(os, message, options) {
        if (getPlatform() === os) {
            throw new PlatformNotSupportedError(message || `The ${os} platform is not supported.`, options);
        }
    }
    /**
     * Throws when a platform doesn't match the current os provided by the runtime.
     * @param os The operating system to check.
     * @param message The message to throw.
     * @param options The property values to set on the error.
     */
    static throwWhenOsSupported(os, message, options) {
        if (getPlatform() !== os) {
            throw new PlatformNotSupportedError(message || `Only the ${os} platform is supported.`, options);
        }
    }
}
exports.PlatformNotSupportedError = PlatformNotSupportedError;
/**
 * An error that is thrown when a function, method, property
 * or a subroutine has an invalid operation.
 *
 * The default message is "Invalid operation."
 */
class InvalidOperationError extends SystemError {
    /**
     * Initializes a new instance of the InvalidOperationError class.
     * @param message The message for the error.
     * @param options The property values to set on the error.
     */
    constructor(message, options) {
        super(message || "Invalid operation.", options);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "InvalidOperationError"
        });
    }
    /**
     * Throws a InvalidOperationError error.
     *
     * @param message The message for the error.
     * @param options The property values to set on the error.
     */
    static throw(message, options) {
        throw new InvalidOperationError(message, options);
    }
    /**
     * Throws a InvalidOperationError if the condition is true.
     *
     * @param condition The condition to evaluate to throw when true.
     * @param message The message for the error.
     * @param options The property values to set on the error.
     */
    static throwIf(condition, message, options) {
        if (condition) {
            throw new InvalidOperationError(message, options);
        }
    }
}
exports.InvalidOperationError = InvalidOperationError;
/**
 * An error for when casting a value from one type to another type
 * is invalid.
 *
 * The default message is "Invalid cast."
 */
class InvalidCastError extends SystemError {
    /**
     * Initializes a new instance of the InvalidCastError class.
     *
     * @param message The message for the error.
     * @param options The property values to set on the error.
     */
    constructor(message, options) {
        super(message || "Invalid cast.", options);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "InvalidCastError"
        });
    }
    /**
     * Throws a InvalidCastError error.
     *
     * @param message The message for the error.
     * @param options The property values to set on the error.
     */
    static throw(message, options) {
        throw new InvalidCastError(message, options);
    }
    /**
     * Throw a InvalidCastError if the condition is true.
     *
     * @param condition The condition to evaluate to throw when true.
     * @param message The message for the error.
     * @param options The property values to set on the error.
     */
    static throwIf(condition, message, options) {
        if (condition) {
            throw new InvalidCastError(message, options);
        }
    }
}
exports.InvalidCastError = InvalidCastError;
/**
 * An error for when a value is null or undefined.
 *
 * The default message is "Null or undefined reference."
 */
class NullReferenceError extends SystemError {
    /**
     * Initializes a new instance of the NullReferenceError class.
     *
     * @param message The message for the error.
     * @param options The property values to set on the error.
     */
    constructor(message, options) {
        super(message || "Null or undefined reference.", options);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "NullReferenceError"
        });
    }
    /**
     * Throws a NullReferenceError error.
     *
     * @param value The value to check.
     * @param message The message for the error.
     * @param options The property values to set on the error.
     */
    static throw(value, message, options) {
        if (value === null || value === undefined) {
            throw new NullReferenceError(message, options);
        }
    }
}
exports.NullReferenceError = NullReferenceError;
/**
 * An error for when there is an issue formatting a value.
 *
 * The default message is "Format error."
 */
class FormatError extends SystemError {
    /**
     * Initializes a new instance of the FormatError class.
     *
     * @param message The message for the error.
     * @param options The property values to set on the error.
     */
    constructor(message, options) {
        super(message || "Format error.", options);
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: "FormatError"
        });
    }
    /**
     * Throw a FormatError error.
     *
     * @param message The message for the error.
     * @param options The property values to set on the error.
     */
    static throw(message, options) {
        throw new FormatError(message, options);
    }
    /**
     * Throws a FormatError if the condition is true.
     *
     * @param condition The condition to evaluate to throw when true.
     * @param message The message for the error.
     * @param options The property values to set on the error.
     */
    static throwIf(condition, message, options) {
        if (condition) {
            throw new FormatError(message, options);
        }
    }
}
exports.FormatError = FormatError;
