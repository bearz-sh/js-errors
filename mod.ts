
export interface IException {
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
     * Gets the stack trace for this error as an array of strings that
     */
    stackTrace: string[];
}

/**
 * The core error type for system errors such 
 * as `ArgumentError`, `FormatError` and `ArgumentNullError`.
 */
export class SystemError extends Error implements IException {
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

    #stackLines?: string[];

    /**
     * Creates a new instance of SystemError.
     * 
     * @param message The message for the error.
     * @param innerError The inner error that caused this error, if any.
     */
    constructor(message: string, innerError?: Error) {
        super(message);

        this.innerError = innerError;
        this.data = {};
    }

    /**
     * Sets the properties of this error from the given object.
     * 
     * @param props The properties to set.
     * @returns This error.
     */
    set(props: Partial<this>) {
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

    constructor(public code: number, message?: string, innerError?: Error) {
        super(message || `Win32 error ${code}. See ${code} for more information using ${win32Docs}.`, innerError);

        this.link = win32Docs;
    }
}

export function collectError(e: Error) {
    const errors: Error[] = [];

    walkError(e, error => errors.push(error));

    return errors;
}

export function walkError(e: Error, callback: (e: Error) => void) : void {
    if (e instanceof AggregateError && e.errors) {
        for (const error of e.errors) {
            walkError(error, callback);
        }
    }

    if (e instanceof SystemError && e.innerError) {
        walkError(e.innerError, callback);
    }

    callback(e);
}

/**
 * Prints the error to the console and if an error derives from SystemError, 
 * it will print the inner error as well.
 * 
 * @param e The error to print to the console.
 * @param format Formats the error to the console.
 * @returns 
 */
export function printError(e: Error, format?: (e: Error) => string) : void {
    if (e instanceof AggregateError && e.errors) {
        for (const error of e.errors) {
            printError(error, format);
        }
    }

    if (e instanceof SystemError && e.innerError) {
        printError(e.innerError, format);
    }

    if(format) {
        console.error(format(e));
        return;
    }

    console.error(e);
}

/**
 * A decorator for hiding a function from the stack trace.
 *
 * @returns {(target: any, _propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor}}
 */
export function hideStack() {
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
                        const start = lines.indexOf('    at ');
                        if (start > -1) {
                            e.stack = e.stack.split('\n').splice(start, 1).join('\n');
                        }
                    }
                    throw e;
                }
            };
        }
        return descriptor;
    };
}

/**
 * An error that is thrown when an argument is invalid for a function or method.
 */
export class ArgumentError extends SystemError {
    /**
     * Gets or sets the name of the parameter that is invalid.
     */
    parameterName: string | null;

    override name = 'ArgumentError';

    constructor(parameterName: string | null = null, message?: string, innerError?: Error) {
        super(message || `Argument ${parameterName} is invalid.`, innerError);
        this.parameterName = parameterName;
    }

    static throw(expression: unknown, parameterName: string, message?: string, innerError?: Error) : asserts expression {
        if (!expression) {
            throw new ArgumentError(parameterName, message, innerError);
        }
    }
}

/**
 * An error that is thrown when an argument fails an expected assertion.
 */
export class AssertionError extends SystemError {
    override name = 'AssertionError';

    constructor(message?: string, innerError?: Error) {
        super(message || 'Assertion failed.', innerError);
    }

    static throw(expression: unknown, message?: string, innerError?: Error) : asserts expression {
        if (!expression) {
            throw new AssertionError(message, innerError);
        }
    }
}


export class ArgumentNullError extends ArgumentError {
    override name = 'ArgumentNullError';

    constructor(parameterName: string | null = null, message?: string, innerError?: Error) {
        super(parameterName, message || `Argument ${parameterName} must not be null or undefined.`, innerError);
        this.parameterName = parameterName;
    }

    static throw(value: unknown, parameterName: string, message?: string, innerError?: Error) : asserts value is NonNullable<typeof value> {
        if (value === null || value === undefined) {
            throw new ArgumentNullError(parameterName, message, innerError);
        }
    }
}

export class TimeoutError extends SystemError {
    override name = 'TimeoutError';

    constructor(message?: string, innerError?: Error) {
        super(message || 'Operation timed out.', innerError);
    }

    static throw(message?: string, innerError?: Error) {
        throw new TimeoutError(message, innerError);
    }

    static throwIf(condition: boolean, message?: string, innerError?: Error) {

        if (condition) {
            throw new TimeoutError(message, innerError);
        }
    }
}

export class NotSupportedError extends SystemError {
    override name = 'NotSupportedError';

    constructor(message?: string, innerError?: Error) {
        super(message || 'Operation is not supported.', innerError);
    }

    static throw(message?: string, innerError?: Error) {
        throw new NotSupportedError(message, innerError);
    }

    static throwIf(condition: boolean, message?: string, innerError?: Error) {    
        if (condition) {
            throw new NotSupportedError(message, innerError);
        }
    }
}

export class ObjectDisposedError extends SystemError {
    override name = 'ObjectDisposedError';

    constructor(message?: string, innerError?: Error) {
        super(message || 'Object is disposed.', innerError);
    }

    static throw(message?: string, innerError?: Error) {
        throw new ObjectDisposedError(message, innerError);
    }

    static throwIf(condition: boolean, message?: string, innerError?: Error) {
        if (condition) {
            throw new ObjectDisposedError(message, innerError);
        }
    }

}

export class ArgumentEmptyError extends ArgumentError {
    override name = 'ArgumentEmptyError';

    constructor(parameterName: string | null = null, message?: string, innerError?: Error) {
        super(parameterName,  message || `Argument ${parameterName} must not be null or empty.`, innerError);
    }

    static throw(value: unknown, parameterName: string, message?: string, innerError?: Error) : asserts value is string {
        if (value === null || value === undefined || (typeof value === 'string' && value.length === 0)) {
            throw new ArgumentEmptyError(parameterName, message, innerError);
        }
    }
}

export class ArgumentRangeError extends ArgumentError {
    value?: unknown;

    override name = 'ArgumentRangeError';
    
    constructor(value: unknown, parameterName?: string, message?: string, innerError?: Error) {
        super(parameterName, message || `Argument ${parameterName} is out of range.`, innerError);
        this.value = value;
    }

    static throw(value: unknown, parameterName: string, message?: string, innerError?: Error) {
        throw new ArgumentRangeError(value, parameterName, message, innerError);
    }

    static throwIf(condition: boolean, value: unknown, parameterName: string, message?: string, innerError?: Error) {
        if (condition) {
            throw new ArgumentRangeError(value, parameterName, message, innerError);
        }
    }
}

export class NotImplementedError extends SystemError {
    override name = 'NotImplementedError';

    constructor(message?: string, innerError?: Error) {
        super(message || 'Not implemented.', innerError);
    }

    static throw(message?: string, innerError?: Error) {
        throw new NotImplementedError(message, innerError);
    }

    static throwIf(condition: boolean, message?: string, innerError?: Error) {
        if (condition) {
            throw new NotImplementedError(message, innerError);
        }
    }
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

    if (g && g.navigator && g.navigator.userAgentData) {
        return g.navigator.userAgentData.platform.toLowerCase();
    }

    return 'unknown';
}

export class PlatformNotSupportedError extends SystemError {

    override name = 'PlatformNotSupportedError';

    constructor(message?: string, innerError?: Error) {
        super(message || 'Platform is not supported.', innerError);
    }

    static getPlatform() {
        return getPlatform();
    }

    static throw(message?: string, innerError?: Error) {
        throw new PlatformNotSupportedError(message, innerError);
    }

    static throwIf(condition: boolean, message?: string, innerError?: Error) {
        if (condition) {
            throw new PlatformNotSupportedError(message, innerError);
        }
    }

    static throwNotSupported(platform: string, message?: string, innerError?: Error) {
        if (getPlatform() === platform) {
            throw new PlatformNotSupportedError(message || `The ${platform} platform is not supported.`, innerError);
        }
    }

    static throwOnlySupportedOn(platform: string, message?: string, innerError?: Error) {
        if (getPlatform() !== platform) {
            throw new PlatformNotSupportedError(message || `Only the ${platform} platform is supported.`, innerError);
        }
    }
}


export class InvalidOperationError extends SystemError {
    override name = 'InvalidOperationError';

    constructor(message?: string, innerError?: Error) {
        super(message || 'Invalid operation', innerError);
    }

    static throw(message?: string, innerError?: Error) {
        throw new InvalidOperationError(message, innerError);
    }

    static throwIf(condition: boolean, message?: string, innerError?: Error) {
        if (condition) {
            throw new InvalidOperationError(message, innerError);
        }
    }
}

export class InvalidCastError extends SystemError {
    override name = 'InvalidCastError';

    constructor(message?: string, innerError?: Error) {
        super(message || 'Invalid cast', innerError);
    }

    static throw(message?: string, innerError?: Error) {
        throw new InvalidCastError(message, innerError);
    }

    static throwIf(condition: boolean, message?: string, innerError?: Error) {
        if (condition) {
            throw new InvalidCastError(message, innerError);
        }
    }
}

export class NullReferenceError extends SystemError {
    override name = 'NullReferenceError';

    constructor(message?: string, innerError?: Error) {
        super(message || 'Null or undefined reference.', innerError);
    }

    static throw(value: unknown, message?: string, innerError?: Error) : asserts value is NonNullable<typeof value> {
        if (value === null || value === undefined) {
            throw new NullReferenceError(message, innerError);
        }
    }
}

export class FormatError extends SystemError {
    override name = 'FormatError';
    
    constructor(message?: string, innerError?: Error) {
        super(message || 'Format error', innerError);
    }

    static throw(message?: string, innerError?: Error) {
        throw new FormatError(message, innerError);
    }

    static throwIf(condition: boolean, message?: string, innerError?: Error) {

        if (condition) {
            throw new FormatError(message, innerError);
        }
    }
}

