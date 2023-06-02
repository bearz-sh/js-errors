/// <reference types="node" />
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
import "./_dnt.polyfills.js";
export interface IExceptionOptions {
    /**
     * The cause of the error. Similar to `innerError` but not
     * necessarily an error.
     */
    cause?: any;
    /**
     * Gets or sets the inner error that caused this error, if any.
     */
    innerError?: Error;
    /**
     * Gets or sets additional data associated with this error.
     */
    data?: Record<string, unknown>;
    /**
     * Gets or sets a link to documentation about this error.
     */
    link?: string | URL;
}
export interface IException extends IExceptionOptions {
    /**
     * Gets or sets the message for this error.
     */
    message: string;
    /**
     * Gets or sets the stack trace for this error.
     */
    stack?: string;
    /**
     * Gets the name of this error.
     */
    readonly name: string;
    /**
     * Gets the stack trace for this error as an array of strings that
     */
    readonly stackTrace: string[];
}
/**
 * Gets the stack trace for the given error. If the error does not have a stack trace,
 * it will return an empty array.
 *
 * @param e The error to get the stack trace for.
 * @returns A string array of the stack trace for each frame.
 */
export declare function getStackTrace(e: Error): string[];
/**
 * Collects all errors from the given error tree and returns them as an array.
 */
export declare function collectError(e: Error): Error[];
/**
 * Walks the error tree and invokes the callback for each error. It will
 * walk the inner error, cause, and aggregate errors if they are an instance
 * of `Error`.
 *
 * @param e The error to walk.
 * @param callback The callback to invoke for each error.
 */
export declare function walkError(e: Error, callback: (e: Error) => void): void;
/**
 * Prints the error to the console and if an error derives from SystemError,
 * it will print the inner error as well.
 *
 * @param e The error to print to the console.
 * @param format Formats the error to the console.
 * @param write A function that overrides the default behavor of writing to console.error.
 */
export declare function printError(e: Error, format?: (e: Error) => string, write?: (data?: any) => void): void;
/**
 * A decorator for hiding a function from the stack trace.
 *
 * @experimental This is experimental and may change or be removed in a future release.
 */
export declare function hideFromStackTrace(): (target: any, _propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
/**
 * The core error type for system errors such
 * as `ArgumentError`, `FormatError` and `ArgumentNullError`.
 */
export declare class SystemError extends Error implements IException {
    #private;
    name: string;
    /**
     * Gets or sets the inner error that caused this error, if any.
     */
    innerError?: Error;
    /**
     * Gets or sets additional data associated with this error.
     */
    data?: Record<string, unknown>;
    /**
     * Gets or sets a link to documentation about this error.
     */
    link?: string | URL;
    /**
     * Creates a new instance of SystemError.
     *
     * @param message The message for the error.
     * @param options The property values to set on the error.
     */
    constructor(message: string, options?: Partial<IExceptionOptions>);
    /**
     * Sets the properties of this error from the given object.
     *
     * @param props The properties to set.
     * @returns This error.
     */
    set(props?: Partial<IExceptionOptions>): this;
    /**
     * Sets the stack for this error.
     */
    set stack(value: string | undefined);
    /**
     * Gets the stack trace for this error as an array of strings that
     * represent each line of the stack.
     *
     * @returns The stack trace for this error.
     */
    get stackTrace(): string[];
    /**
     * Sets the stack trace for this error.
     */
    set stackTrace(value: string[]);
}
/**
 * An error that represents an Win32 error that contains a system error code. This is for
 * Foreign Function Interface (FFI) calls that return a Win32 error code.
 *
 * The default message is "Win32 error ${code}. See ${code} for more information using ${win32Docs}."
 */
export declare class Win32Error extends SystemError {
    code: number;
    name: string;
    /**
     * Initializes a new instance of the Win32Error class.
     *
     * @param code The windows system error code.
     * @param message The message for the error.
     * @param options The property values to set on the error.
     */
    constructor(code: number, message?: string, options?: Partial<IExceptionOptions>);
    static throw(code: number, message?: string, options?: Partial<IExceptionOptions>): never;
}
/**
 * An error for arguments that are invalid.
 *
 * The default message is "Argument ${parameterName} is invalid."
 */
export declare class ArgumentError extends SystemError {
    /**
     * Gets or sets the name of the parameter that is invalid.
     */
    parameterName?: string | null;
    name: string;
    /**
     * Initializes a new instance of the ArgumentError class.
     *
     * @param parameterName The name of the parameter that is invalid.
     * @param message The message for the error.
     * @param options The property values to set on the error.
     */
    constructor(parameterName?: string, message?: string, options?: Partial<IExceptionOptions>);
    /**
     * Throws an ArgumentError if the expression is true.
     * @param expression The expression to evaluate to throw when true.
     * @param parameterName The name of the parameter that is invalid.
     * @param message The message for the error.
     * @param options The property values to set on the error.
     *
     * @throws {ArgumentError} Thrown when the expression is false.
     */
    static throwIf(expression: unknown, parameterName: string, message?: string, options?: Partial<IExceptionOptions>): asserts expression;
}
/**
 * An error for when an argument is null, undefined, or empty.
 *
 * The default message is "Argument ${parameterName} must not be null, undefined, or empty."
 */
export declare class ArgumentEmptyError extends ArgumentError {
    name: string;
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
    constructor(parameterName?: string, message?: string, options?: Partial<IExceptionOptions>);
    /**
     * Throws an ArgumentEmptyError if the value is null, undefined, or empty.
     *
     * @param value The value to check if it is null, undefined, or empty.
     * @param parameterName The name of the parameter that is invalid.
     * @param message Ths message for the error.
     * @param options The property values to set on the error.
     */
    static throw<T>(value: null | undefined | ArrayLike<T>, parameterName: string, message?: string, options?: Partial<IExceptionOptions>): asserts value is ArrayLike<T>;
    /**
     * Throws an ArgumentEmptyError if the expression is true.
     *
     * @param expression The expression to evaluate to throw when true.
     * @param parameterName The name of the parameter that is invalid.
     * @param message The message for the error.
     * @param options The property values to set on the error.
     */
    static throwIf(expression: unknown, parameterName: string, message?: string, options?: Partial<IExceptionOptions>): asserts expression;
}
/**
 * An error that for arguments that are null or undefined.
 *
 * The default message is "Argument ${parameterName} must not be null or undefined."
 */
export declare class ArgumentNullError extends ArgumentError {
    name: string;
    /**
     * Initializes a new instance of the ArgumentNullError class.
     *
     * @param parameterName The name of the parameter that is invalid.
     * @param message The message for the error.
     * @param innerError This inner error.
     */
    constructor(parameterName?: string, message?: string, options?: Partial<IExceptionOptions>);
    /**
     * Throws an ArgumentNullError if the value is null or undefined.
     *
     * @param value The value to check if it is null or undefined.
     * @param parameterName The name of the parameter that is invalid.
     * @param message The message for the error.
     * @param innerError This inner error.
     */
    static throw(value: unknown, parameterName: string, message?: string, options?: Partial<IExceptionOptions>): asserts value is NonNullable<typeof value>;
    /**
     * Throws an ArgumentNullError if the expression is true.
     *
     * @param expression The expression to evaluate to throw when true.
     * @param parameterName The name of the parameter that is invalid.
     * @param message The message for the error.
     * @param options The property values to set on the error.
     */
    static throwIf(expression: unknown, parameterName: string, message?: string, options?: Partial<IExceptionOptions>): asserts expression;
}
/**
 * An error for when arguments are out of range such as length or indexes.
 *
 * The default message is "Argument ${parameterName} is out of range."
 */
export declare class ArgumentRangeError extends ArgumentError {
    value?: unknown;
    name: string;
    /**
     * Initializes a new instance of the ArgumentRangeError class.
     *
     * @param value This value that is out of range.
     * @param parameterName This name of the parameter that is invalid.
     * @param message This message for the error.
     * @param innerError This inner error.
     */
    constructor(value: unknown, parameterName?: string, message?: string, options?: Partial<IExceptionOptions>);
    /**
     * Throws an ArgumentRangeError error.
     *
     * @param value The value to check if it is out of range.
     * @param parameterName The name of the parameter that is invalid.
     * @param message The message for the error.
     * @param innerError This inner error.
     */
    static throw(value: unknown, parameterName: string, message?: string, options?: Partial<IExceptionOptions>): void;
    /**
     * Throws an ArgumentRangeError if the expression is true.
     *
     * @param expression The expression to evaluate to throw when false.
     * @param parameterName The name of the parameter that is invalid.
     * @param message This message for the error.
     * @param innerError This inner error.
     */
    static throwIf(expression: unknown, parameterName: string, message?: string, options?: Partial<IExceptionOptions>): asserts expression;
}
/**
 * An error for failed assertions.
 *
 * The default message is "Assertion failed."
 */
export declare class AssertionError extends SystemError {
    name: string;
    /**
     * Initializes a new instance of the AssertionError class.
     *
     * @param message This message for the error.
     * @param innerError This inner error.
     */
    constructor(message?: string, options?: Partial<IExceptionOptions>);
    static throw(message?: string, options?: Partial<IExceptionOptions>): void;
    /**
     * Throws an AssertionError error.
     *
     * @param expression This expression to evaluate to throw when false.
     * @param message This message for the error.
     * @param innerError This inner error.
     */
    static throwIf(expression: unknown, message?: string, options?: Partial<IExceptionOptions>): asserts expression;
}
/**
 * An error for when an operation times out.
 *
 * The default message is "Operation timed out."
 */
export declare class TimeoutError extends SystemError {
    name: string;
    /**
     * Initializes a new instance of the TimeoutError class.
     *
     * @param message The message for the error.
     * @param innerError This inner error.
     */
    constructor(message?: string, options?: Partial<IExceptionOptions>);
    /**
     * throw a TimeoutError error.
     *
     * @param message The message for the error.
     * @param innerError This inner error.
     */
    static throw(message?: string, options?: Partial<IExceptionOptions>): void;
    /**
     * Throws a TimeoutError if the condition is true.
     *
     * @param condition The condition to evaluate to throw when true.
     * @param message The message for the error.
     * @param innerError This inner error.
     */
    static throwIf(condition: boolean, message?: string, options?: Partial<IExceptionOptions>): void;
}
/**
 * An error for when a function, method, property, or subroutine
 * general action, enum, or case is not supported.
 *
 * The default message is "Operation is not supported."
 */
export declare class NotSupportedError extends SystemError {
    name: string;
    /**
     * Initializes a new instance of the NotSupportedError class.
     *
     * @param message The message for the error.
     * @param options The property values to set on the error.
     */
    constructor(message?: string, options?: Partial<IExceptionOptions>);
    /**
     * Throws a NotSupportedError error.
     *
     * @param message The message for the error.
     * @param innerError This inner error.
     */
    static throw(message?: string, options?: Partial<IExceptionOptions>): void;
    /**
     * @param condition The condition to evaluate to throw when true.
     * @param message
     * @param innerError
     */
    static throwIf(condition: boolean, message?: string, options?: Partial<IExceptionOptions>): void;
}
/**
 * An error for when an object has disposed of resources and can
 * no longer be used.
 *
 * The default message is "Object is disposed."
 */
export declare class ObjectDisposedError extends SystemError {
    name: string;
    constructor(message?: string, options?: Partial<IExceptionOptions>);
    static throw(message?: string, options?: Partial<IExceptionOptions>): void;
    static throwIf(condition: boolean, message?: string, options?: Partial<IExceptionOptions>): void;
}
/**
 * An error for when a function, method, property, case,
 * or a subroutine is not implemented.
 *
 * The default message is "Not implemented."
 */
export declare class NotImplementedError extends SystemError {
    name: string;
    /**
     * Initializes a new instance of the NotImplementedError class.
     * @param message The message for the error.
     * @param options The property values to set on the error.
     */
    constructor(message?: string, options?: Partial<IExceptionOptions>);
    /**
     * Throws a NotImplementedError error.
     *
     * @param message The message for the error.
     * @param options The property values to set on the error.
     */
    static throw(message?: string, options?: Partial<IExceptionOptions>): void;
    /**
     * Throws a NotImplementedError if the condition is true.
     *
     * @param condition The condition to evaluate to throw when true.
     * @param message The message for the error.
     * @param options The property values to set on the error.
     */
    static throwIf(condition: boolean, message?: string, options?: Partial<IExceptionOptions>): void;
}
/**
 * An error for when a platform such as an operating system is not supported.
 *
 * The default message is "Platform is not supported."
 */
export declare class PlatformNotSupportedError extends SystemError {
    name: string;
    /**
     * Initializes a new instance of the PlatformNotSupportedError class.
     *
     * @param message The message for the error.
     * @param options The property values to set on the error.
     */
    constructor(message?: string, options?: Partial<IExceptionOptions>);
    /**
     * Gets the current platform.
     */
    static get platform(): string;
    /**
     * Throws a PlatformNotSupportedError error.
     *
     * @param message The message for the error.
     * @param options The property values to set on the error.
     */
    static throw(message?: string, options?: Partial<IExceptionOptions>): void;
    /**
     * Throws if the condition is true.
     *
     * @param condition The condition to evaluate to throw when true.
     * @param message The message for the error.
     * @param options The property values to set on the error.
     */
    static throwIf(condition: boolean, message?: string, options?: Partial<IExceptionOptions>): void;
    /**
     * Throws when a platform doesn't match the current os provided by the runtime.
     *
     * @param os The operating system to check.
     * @param message The message to
     * @param options The property values to set on the error.
     */
    static throwWhenOsNotSupported(os: string, message?: string, options?: Partial<IExceptionOptions>): void;
    /**
     * Throws when a platform doesn't match the current os provided by the runtime.
     * @param os The operating system to check.
     * @param message The message to throw.
     * @param options The property values to set on the error.
     */
    static throwWhenOsSupported(os: string, message?: string, options?: Partial<IExceptionOptions>): void;
}
/**
 * An error that is thrown when a function, method, property
 * or a subroutine has an invalid operation.
 *
 * The default message is "Invalid operation."
 */
export declare class InvalidOperationError extends SystemError {
    name: string;
    /**
     * Initializes a new instance of the InvalidOperationError class.
     * @param message The message for the error.
     * @param options The property values to set on the error.
     */
    constructor(message?: string, options?: Partial<IExceptionOptions>);
    /**
     * Throws a InvalidOperationError error.
     *
     * @param message The message for the error.
     * @param options The property values to set on the error.
     */
    static throw(message?: string, options?: Partial<IExceptionOptions>): void;
    /**
     * Throws a InvalidOperationError if the condition is true.
     *
     * @param condition The condition to evaluate to throw when true.
     * @param message The message for the error.
     * @param options The property values to set on the error.
     */
    static throwIf(condition: boolean, message?: string, options?: Partial<IExceptionOptions>): void;
}
/**
 * An error for when casting a value from one type to another type
 * is invalid.
 *
 * The default message is "Invalid cast."
 */
export declare class InvalidCastError extends SystemError {
    name: string;
    /**
     * Initializes a new instance of the InvalidCastError class.
     *
     * @param message The message for the error.
     * @param options The property values to set on the error.
     */
    constructor(message?: string, options?: Partial<IExceptionOptions>);
    /**
     * Throws a InvalidCastError error.
     *
     * @param message The message for the error.
     * @param options The property values to set on the error.
     */
    static throw(message?: string, options?: Partial<IExceptionOptions>): void;
    /**
     * Throw a InvalidCastError if the condition is true.
     *
     * @param condition The condition to evaluate to throw when true.
     * @param message The message for the error.
     * @param options The property values to set on the error.
     */
    static throwIf(condition: boolean, message?: string, options?: Partial<IExceptionOptions>): void;
}
/**
 * An error for when a value is null or undefined.
 *
 * The default message is "Null or undefined reference."
 */
export declare class NullReferenceError extends SystemError {
    name: string;
    /**
     * Initializes a new instance of the NullReferenceError class.
     *
     * @param message The message for the error.
     * @param options The property values to set on the error.
     */
    constructor(message?: string, options?: Partial<IExceptionOptions>);
    /**
     * Throws a NullReferenceError error.
     *
     * @param value The value to check.
     * @param message The message for the error.
     * @param options The property values to set on the error.
     */
    static throw(value: unknown, message?: string, options?: Partial<IExceptionOptions>): asserts value is NonNullable<typeof value>;
}
/**
 * An error for when there is an issue formatting a value.
 *
 * The default message is "Format error."
 */
export declare class FormatError extends SystemError {
    name: string;
    /**
     * Initializes a new instance of the FormatError class.
     *
     * @param message The message for the error.
     * @param options The property values to set on the error.
     */
    constructor(message?: string, options?: Partial<IExceptionOptions>);
    /**
     * Throw a FormatError error.
     *
     * @param message The message for the error.
     * @param options The property values to set on the error.
     */
    static throw(message?: string, options?: Partial<IExceptionOptions>): void;
    /**
     * Throws a FormatError if the condition is true.
     *
     * @param condition The condition to evaluate to throw when true.
     * @param message The message for the error.
     * @param options The property values to set on the error.
     */
    static throwIf(condition: boolean, message?: string, options?: Partial<IException>): void;
}
