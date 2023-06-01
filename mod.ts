
export interface IExceptionOptions {
    /**
     * The cause of the error. Similar to `innerError` but not
     * necessarily an error.
     */
    // deno-lint-ignore no-explicit-any
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

export function getStackTrace(e: Error) : string[] {
    if (e.stack) {
        return e.stack.split('\n').map(line => line.trim()).filter(o => o.startsWith("at "));
    }

    return [];
}

/**
 * Collects all errors from the given error tree and returns them as an array.
 */
export function collectError(e: Error) {
    const errors: Error[] = [];

    walkError(e, error => errors.push(error));

    return errors;
}

/**
 * Walks the error tree and invokes the callback for each error. It will
 * walk the inner error, cause, and aggregate errors if they are an instance
 * of `Error`.
 * 
 * @param e The error to walk.
 * @param callback The callback to invoke for each error.
 */
export function walkError(e: Error, callback: (e: Error) => void) : void {
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

/**
 * Prints the error to the console and if an error derives from SystemError, 
 * it will print the inner error as well.
 * 
 * @param e The error to print to the console.
 * @param format Formats the error to the console.
 * @param write A function that overrides the default behavor of writing to console.error.
 */
// deno-lint-ignore no-explicit-any
export function printError(e: Error, format?: (e: Error) => string, write?: (data?: any) => void) : void {
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
        else 
        {
            write(e.cause);
        }
    }

    if(format) {
        write(format(e));
        return;
    }

    write(e);
}

function getPlatform() : string {
    // deno-lint-ignore no-explicit-any
    const g = globalThis as any;
    if (g && g.Deno && g.Deno.build) {
        return g.Deno.build.os;
    }

    if (g && g.process && g.process.platform) {
        const os = g.process.platform;
        if (os === 'win32') {
            return 'windows';
        }
    }

    if (g && g.navigator) {
        if (g.navigator.userAgentData){
            return g.navigator.userAgentData.platform.toLowerCase();
        }

        if (g.navigator.platform) {
            const parts = g.navigator.platform.split(' ');
            if (parts.length > 0) {
                return parts[0].toLowerCase();
            }
        }
    }


    return 'unknown';
}


/**
 * A decorator for hiding a function from the stack trace.
 * 
 * @experimental This is experimental and may change or be removed in a future release.
 */
export function hideFromStackTrace() {
    // deno-lint-ignore no-explicit-any
    return function (target: any, _propertyKey: string, descriptor: PropertyDescriptor) {
        const original = descriptor.value;
        if (typeof original === 'function') {
            
            descriptor.value = (...args: unknown[]) => {
                try {
                    return original.apply(target, args);
                } catch (e) {
                    if (e instanceof Error && e.stack) {
                       
                        // first line of stack trace is the message, though could be multiple lines
                        // if the dev used '\n' in the error message.
                        // todo: figure out messages can exceed the first line.
                        const lines = e.stack.split('\n');
                        const line = lines.filter(o => o.includes(original.name));
                        if (!line || line.length === 0) {
                            throw e;
                        }

                        const start = lines.indexOf(line[0]);
                        if (start > -1) {
                            lines.splice(start, 2)
                            e.stack = lines.join('\n');
                        }
                        
                        throw e;
                    }
                }
            };
        }
        return descriptor;
    };
}

/**
 * The core error type for system errors such 
 * as `ArgumentError`, `FormatError` and `ArgumentNullError`.
 */
export class SystemError extends Error implements IException {
    #stackLines?: string[];

    override name = 'SystemError';

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
    constructor(message: string, options?: Partial<IExceptionOptions>) {
        super(message);
        this.set(options);
    }

    /**
     * Sets the properties of this error from the given object.
     * 
     * @param props The properties to set.
     * @returns This error.
     */
    set(props?: Partial<IExceptionOptions>) {
        if (props === undefined) 
            return this;
        
        for (const [key, value] of Object.entries(props)) {
            if (key === 'name' || key === 'stack') {
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
    set stack(value: string | undefined) {
        this.#stackLines = undefined;
        super.stack = value;
    }

    /**
     * Gets the stack trace for this error as an array of strings that
     * represent each line of the stack.
     * 
     * @returns The stack trace for this error.
     */
    get stackTrace(): string[] {
        if (!this.#stackLines) {
            if (this.stack) {
                this.#stackLines = this.stack.split('\n').map(line => line.trim()).filter(o => o.startsWith("at "));
            } else {
                this.#stackLines = [];
            }
        }

        return this.#stackLines;
    }

    /**
     * Sets the stack trace for this error.
     */
    set stackTrace(value: string[]) {
        this.#stackLines = value;
        super.stack = value.join('\n');
    }
}

const win32Docs = "https://github.com/MicrosoftDocs/win32/blob/docs/desktop-src/Debug/system-error-codes.md"

/**
 * Represents a Win32 error that contains a system error code. This is for
 * Foreign Function Interface (FFI) calls that return a Win32 error code.
 */
export class Win32Error extends SystemError {
    override name = 'Win32Error';

    /**
     * Initializes a new instance of the Win32Error class.
     * 
     * @param code The windows system error code.
     * @param message The message for the error.
     * @param options The property values to set on the error.
     */
    constructor(public code: number, message?: string, options?: Partial<IExceptionOptions>) {
        super(message || `Win32 error ${code}. See ${code} for more information using ${win32Docs}.`, options);
        this.link = win32Docs;
    }
}

/**
 * An error that is thrown when an argument is invalid for a function or method.
 * 
 * The default message is "Argument ${parameterName} is invalid."
 */
export class ArgumentError extends SystemError {
    /**
     * Gets or sets the name of the parameter that is invalid.
     */
    parameterName?: string | null;

    override name = 'ArgumentError';

    /**
     * Initializes a new instance of the ArgumentError class.
     * 
     * @param parameterName The name of the parameter that is invalid.
     * @param message The message for the error.
     * @param options The property values to set on the error.
     */
    constructor(parameterName?: string, message?: string, options?: Partial<IExceptionOptions>) {
        super(message || `Argument ${parameterName} is invalid.`, options);
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
    static throwIf(expression: unknown, parameterName: string, message?: string, options?: Partial<IExceptionOptions>) : asserts expression {
        if (expression) {
            throw new ArgumentError(parameterName, message, options);
        }
    }
}

/**
 * An error that is thrown when an argument is null, undefined, or empty.
 * 
 * The default message is "Argument ${parameterName} must not be null, undefined, or empty."
 */
export class ArgumentEmptyError extends ArgumentError {
    override name = 'ArgumentEmptyError';

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
    constructor(parameterName?: string, message?: string, options?: Partial<IExceptionOptions>) {
        super(
            parameterName,  
            message || `Argument ${parameterName} must not be null, undefined, or empty.`, 
            options);
    }

    /**
     * Throws an ArgumentEmptyError if the value is null, undefined, or empty.
     * 
     * @param value The value to check if it is null, undefined, or empty.
     * @param parameterName The name of the parameter that is invalid.
     * @param message Ths message for the error.
     * @param options The property values to set on the error.
     */
    static throw<T>(value: null | undefined | ArrayLike<T>, parameterName: string, message?: string, options?: Partial<IExceptionOptions>) : asserts value is ArrayLike<T> {
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

    static throwIf(expression: unknown, parameterName: string, message?: string, options?: Partial<IExceptionOptions>) : asserts expression {
        if (expression) {
            throw new ArgumentEmptyError(parameterName, message, options);
        }
    }
}

/**
 * An error that is thrown when an argument is null or undefined.
 * 
 * The default message is "Argument ${parameterName} must not be null or undefined."
 */
export class ArgumentNullError extends ArgumentError {
    override name = 'ArgumentNullError';

    /**
     * Initializes a new instance of the ArgumentNullError class.
     * 
     * @param parameterName The name of the parameter that is invalid.
     * @param message The message for the error.
     * @param innerError This inner error.
     */
    constructor(parameterName?: string, message?: string, options?: Partial<IExceptionOptions>) {
        super(
            parameterName, 
            message || `Argument ${parameterName} must not be null or undefined.`, 
            options);
    }

    /**
     * Throws an ArgumentNullError if the value is null or undefined.
     * 
     * @param value The value to check if it is null or undefined.
     * @param parameterName The name of the parameter that is invalid.
     * @param message The message for the error.
     * @param innerError This inner error.
     */
    static throw(value: unknown, parameterName: string, message?: string, options?: Partial<IExceptionOptions>) : asserts value is NonNullable<typeof value> {
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
    static throwIf(expression: unknown, parameterName: string, message?: string, options?: Partial<IExceptionOptions>) : asserts expression {
        if (expression) {
            throw new ArgumentNullError(parameterName, message, options);
        }
    }
}

/**
 * An error that is thrown when an argument is out of range.
 * 
 * The default message is "Argument ${parameterName} is out of range."
 */
export class ArgumentRangeError extends ArgumentError {
    value?: unknown;

    override name = 'ArgumentRangeError';
    
    /**
     * Initializes a new instance of the ArgumentRangeError class.
     * 
     * @param value This value that is out of range.
     * @param parameterName This name of the parameter that is invalid.
     * @param message This message for the error.
     * @param innerError This inner error.
     */
    constructor(value: unknown, parameterName?: string, message?: string, options?: Partial<IExceptionOptions>) {
        super(parameterName, message || `Argument ${parameterName} is out of range.`, options);
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
    static throw(value: unknown, parameterName: string, message?: string, options?: Partial<IExceptionOptions>) {
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
    static override throwIf(expression: unknown, parameterName: string, message?: string, options?: Partial<IExceptionOptions>) : asserts expression {
        if (expression) {
            throw new ArgumentRangeError(undefined, parameterName, message, options);
        }
    }
}

/**
 * An error that is thrown when an argument fails an expected assertion.
 * 
 * The message is "Assertion failed."
 */
export class AssertionError extends SystemError {
    override name = 'AssertionError';

    /**
     * Initializes a new instance of the AssertionError class.
     * 
     * @param message This message for the error.
     * @param innerError This inner error.
     */
    constructor(message?: string, options?: Partial<IExceptionOptions>) {
        super(message || 'Assertion failed.', options);
    }

    /**
     * Throws an AssertionError error.
     * 
     * @param expression This expression to evaluate to throw when false.
     * @param message This message for the error.
     * @param innerError This inner error.
     */
    static throw(expression: unknown, message?: string, options?: Partial<IExceptionOptions>) : asserts expression {
        if (!expression) {
            throw new AssertionError(message, options);
        }
    }
}

/**
 * An error that is thrown when an argument is empty.
 * 
 * The default message is "Argument ${parameterName} must not be empty."
 */
export class TimeoutError extends SystemError {
    override name = 'TimeoutError';

    /**
     * Initializes a new instance of the TimeoutError class.
     * 
     * @param message The message for the error.
     * @param innerError This inner error.
     */
    constructor(message?: string, options?: Partial<IExceptionOptions>) {
        super(message || 'Operation timed out.', options);
    }

    /**
     * throw a TimeoutError error.
     * 
     * @param message The message for the error.
     * @param innerError This inner error.
     */
    static throw(message?: string, options?: Partial<IExceptionOptions>) {
        throw new TimeoutError(message, options);
    }

    /**
     * Throws a TimeoutError if the condition is true.
     * 
     * @param condition The condition to evaluate to throw when true.
     * @param message The message for the error.
     * @param innerError This inner error.
     */
    static throwIf(condition: boolean, message?: string, options?: Partial<IExceptionOptions>) {

        if (condition) {
            throw new TimeoutError(message, options);
        }
    }
}

/**
 * An error that is thrown when an argument is empty.
 * 
 * The default message is "Argument ${parameterName} must not be empty."
 */
export class NotSupportedError extends SystemError {
    override name = 'NotSupportedError';

    /**
     * Initializes a new instance of the NotSupportedError class.
     * 
     * @param message The message for the error.
     * @param options The property values to set on the error.
     */
    constructor(message?: string, options?: Partial<IExceptionOptions>) {
        super(message || 'Operation is not supported.', options);
    }

    /**
     * Throws a NotSupportedError error.
     * 
     * @param message The message for the error.
     * @param innerError This inner error.
     */
    static throw(message?: string, options?: Partial<IExceptionOptions>) {
        throw new NotSupportedError(message, options);
    }


    /**
     * 
     * @param condition The condition to evaluate to throw when true.
     * @param message 
     * @param innerError 
     */
    static throwIf(condition: boolean, message?: string, options?: Partial<IExceptionOptions>) {    
        if (condition) {
            throw new NotSupportedError(message, options);
        }
    }
}

/**
 * An error that is thrown when an object is disposed.
 * 
 * The default message is "Object is disposed."
 */
export class ObjectDisposedError extends SystemError {
    override name = 'ObjectDisposedError';

    constructor(message?: string, options?: Partial<IExceptionOptions>) {
        super(message || 'Object is disposed.', options);
    }

    static throw(message?: string, options?: Partial<IExceptionOptions>) {
        throw new ObjectDisposedError(message, options);
    }

    static throwIf(condition: boolean, message?: string, options?: Partial<IExceptionOptions>) {
        if (condition) {
            throw new ObjectDisposedError(message, options);
        }
    }
}

/**
 * An error that is thrown when a fucntion, method, property
 * or a subroutine is not implemented.
 * 
 * The default message is "Not implemented."
 */
export class NotImplementedError extends SystemError {
    override name = 'NotImplementedError';

    /**
     * Initializes a new instance of the NotImplementedError class.
     * @param message The message for the error.
     * @param options The property values to set on the error.
     */
    constructor(message?: string, options?: Partial<IExceptionOptions>) {
        super(message || 'Not implemented.', options);
    }

    /**
     * Throws a NotImplementedError error.
     * 
     * @param message The message for the error.
     * @param options The property values to set on the error.
     */
    static throw(message?: string, options?: Partial<IExceptionOptions>) {
        throw new NotImplementedError(message, options);
    }

    /**
     * Throws a NotImplementedError if the condition is true.
     * 
     * @param condition The condition to evaluate to throw when true.
     * @param message The message for the error.
     * @param options The property values to set on the error.
     */
    static throwIf(condition: boolean, message?: string, options?: Partial<IExceptionOptions>) {
        if (condition) {
            throw new NotImplementedError(message, options);
        }
    }
}

/**
 * An error that is thrown when a platform is not supported such as an operating system.
 * 
 * The default message is "Platform is not supported."
 */
export class PlatformNotSupportedError extends SystemError {

    override name = 'PlatformNotSupportedError';

    /**
     * Initializes a new instance of the PlatformNotSupportedError class.
     * 
     * @param message The message for the error.
     * @param options The property values to set on the error.
     */
    constructor(message?: string, options?: Partial<IExceptionOptions>) {
        super(message || 'Platform is not supported.', options);
    }

    /**
     * Gets the current platform.
     */
    static get platform() : string {
        return getPlatform();
    }

    /**
     * Throws a PlatformNotSupportedError error.
     * 
     * @param message The message for the error.
     * @param options The property values to set on the error.
     */
    static throw(message?: string, options?: Partial<IExceptionOptions>) {
        throw new PlatformNotSupportedError(message, options);
    }

    /**
     * Throws if the condition is true.
     * 
     * @param condition The condition to evaluate to throw when true.
     * @param message The message for the error.
     * @param options The property values to set on the error.
     */
    static throwIf(condition: boolean, message?: string, options?: Partial<IExceptionOptions>) {
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
    static throwWhenOsNotSupported(os: string, message?: string, options?: Partial<IExceptionOptions>) {
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
    static throwWhenOsSupported(os: string, message?: string, options?: Partial<IExceptionOptions>) {
        if (getPlatform() !== os) {
            throw new PlatformNotSupportedError(message || `Only the ${os} platform is supported.`, options);
        }
    }
}

/**
 * An error that is thrown when a function, method, property
 * or a subroutine has an invalid operation.
 * 
 * The default message is "Invalid operation."
 */
export class InvalidOperationError extends SystemError {
    override name = 'InvalidOperationError';

    /**
     * Initializes a new instance of the InvalidOperationError class.
     * @param message The message for the error.
     * @param options The property values to set on the error.
     */
    constructor(message?: string, options?: Partial<IExceptionOptions>) {
        super(message || 'Invalid operation.', options);
    }

    /**
     * Throws a InvalidOperationError error.
     * 
     * @param message The message for the error.
     * @param options The property values to set on the error.
     */
    static throw(message?: string, options?: Partial<IExceptionOptions>) {
        throw new InvalidOperationError(message, options);
    }

    /**
     * Throws a InvalidOperationError if the condition is true.
     * 
     * @param condition The condition to evaluate to throw when true.
     * @param message The message for the error.
     * @param options The property values to set on the error.
     */
    static throwIf(condition: boolean, message?: string, options?: Partial<IExceptionOptions>) {
        if (condition) {
            throw new InvalidOperationError(message, options);
        }
    }
}

/**
 * An error that is thrown when a function, method, property
 * or a subroutine has an invalid cast between types.
 * 
 * The default message is "Invalid cast."
 */
export class InvalidCastError extends SystemError {
    override name = 'InvalidCastError';

    /**
     * Initializes a new instance of the InvalidCastError class.
     * 
     * @param message The message for the error.
     * @param options The property values to set on the error.
     */
    constructor(message?: string, options?: Partial<IExceptionOptions>) {
        super(message || 'Invalid cast.', options);
    }

    /**
     * Throws a InvalidCastError error.
     * 
     * @param message The message for the error.
     * @param options The property values to set on the error.
     */
    static throw(message?: string, options?: Partial<IExceptionOptions>) {
        throw new InvalidCastError(message, options);
    }

    /**
     * Throw a InvalidCastError if the condition is true.
     * 
     * @param condition The condition to evaluate to throw when true.
     * @param message The message for the error.
     * @param options The property values to set on the error.
     */
    static throwIf(condition: boolean, message?: string, options?: Partial<IExceptionOptions>) {
        if (condition) {
            throw new InvalidCastError(message, options);
        }
    }
}
/**
 * An error that is thrown when a function, method, property
 * or a subroutine has a value that is a null or undefined reference.
 * 
 * The default message is "Null or undefined reference."
 */
export class NullReferenceError extends SystemError {
    override name = 'NullReferenceError';

    /**
     * Initializes a new instance of the NullReferenceError class.
     * 
     * @param message The message for the error.
     * @param options The property values to set on the error.
     */
    constructor(message?: string, options?: Partial<IExceptionOptions>) {
        super(message || 'Null or undefined reference.', options);
    }

    /**
     * Throws a NullReferenceError error.
     * 
     * @param value The value to check.
     * @param message The message for the error.
     * @param options The property values to set on the error.
     */
    static throw(value: unknown, message?: string, options?: Partial<IExceptionOptions>) : asserts value is NonNullable<typeof value> {
        if (value === null || value === undefined) {
            throw new NullReferenceError(message, options);
        }
    }
}

/**
 * An error that is thrown when there is a format exception.
 * 
 * The default message is "Format error."
 */
export class FormatError extends SystemError {
    override name = 'FormatError';
    
    /**
     * Initializes a new instance of the FormatError class.
     * 
     * @param message The message for the error.
     * @param options The property values to set on the error.
     */
    constructor(message?: string, options?: Partial<IExceptionOptions>) {
        super(message || 'Format error.', options);
    }

    /**
     * Throw a FormatError error.
     * 
     * @param message The message for the error.
     * @param options The property values to set on the error.
     */
    static throw(message?: string, options?: Partial<IExceptionOptions>) {
        throw new FormatError(message, options);
    }

    /**
     * Throws a FormatError if the condition is true.
     * 
     * @param condition The condition to evaluate to throw when true.
     * @param message The message for the error.
     * @param options The property values to set on the error.
     */
    static throwIf(condition: boolean, options?: Partial<IException>) {
        if (condition) {
            const error = new FormatError();
            if (options)
                error.set(options)
                
            throw error;
        }
    }
}