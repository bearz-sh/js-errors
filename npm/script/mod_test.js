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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const dntShim = __importStar(require("./_dnt.test_shims.js"));
const assert = __importStar(require("@bearz-sh/assertions"));
const mod_js_1 = require("./mod.js");
dntShim.Deno.test("SystemError should have correct name", () => {
    const error = new mod_js_1.SystemError("test error");
    assert.equals(error.name, "SystemError");
});
dntShim.Deno.test("SystemError should have correct message", () => {
    const message = "test error";
    const error = new mod_js_1.SystemError(message);
    assert.equals(error.message, message);
});
dntShim.Deno.test("SystemError should have correct innerError", () => {
    const innerError = new Error("inner error");
    const error = new mod_js_1.SystemError("test error", { innerError });
    assert.equals(error.innerError, innerError);
});
dntShim.Deno.test("SystemError should have correct data", () => {
    const data = { foo: "bar" };
    const error = new mod_js_1.SystemError("test error");
    error.data = data;
    assert.equals(error.data, data);
});
dntShim.Deno.test("SystemError should have correct link", () => {
    const link = "https://example.com";
    const error = new mod_js_1.SystemError("test error");
    error.link = link;
    assert.equals(error.link, link);
});
dntShim.Deno.test("SystemError should have correct stackTrace", () => {
    try {
        throw new mod_js_1.SystemError("test error");
    }
    catch (e) {
        assert.ok(e.stackTrace.length > 0);
        // extension becomes js in npm
        assert.ok(e.stackTrace[0].includes("mod_test"));
    }
});
dntShim.Deno.test("Win32Error", () => {
    const code = 200;
    const win32Docs = "https://github.com/MicrosoftDocs/win32/blob/docs/desktop-src/Debug/system-error-codes.md";
    const e = assert.throws(() => {
        mod_js_1.Win32Error.throw(code);
    }, mod_js_1.Win32Error, `Win32 error ${code}. See ${code} for more information using ${win32Docs}.`);
    assert.equals(e.name, "Win32Error");
    assert.exists(e.stack);
    assert.equals(e.code, code);
    const e2 = assert.throws(() => {
        mod_js_1.Win32Error.throw(0, "Bad Code", { innerError: e });
    }, mod_js_1.Win32Error, "Bad Code");
    assert.equals(e2.name, "Win32Error");
    assert.equals(e2.message, "Bad Code");
    assert.equals(e2.innerError, e);
});
dntShim.Deno.test("PlatformNotSupportedError", () => {
    const e = assert.throws(() => {
        mod_js_1.PlatformNotSupportedError.throw();
    }, mod_js_1.PlatformNotSupportedError, "Platform is not supported.");
    assert.equals(e.name, "PlatformNotSupportedError");
    assert.exists(e.stack);
    const e2 = assert.throws(() => {
        mod_js_1.PlatformNotSupportedError.throw("Windows not supported.", { innerError: e });
    }, mod_js_1.PlatformNotSupportedError, "Windows not supported.");
    assert.equals(e2.name, "PlatformNotSupportedError");
    assert.equals(e2.innerError, e);
});
dntShim.Deno.test("AssertionError", () => {
    const e = assert.throws(() => {
        mod_js_1.AssertionError.throw();
    }, mod_js_1.AssertionError, "Assertion failed.");
    assert.equals(e.name, "AssertionError");
    assert.exists(e.stack);
    const e2 = assert.throws(() => {
        mod_js_1.AssertionError.throw("You failed.", { innerError: e });
    }, mod_js_1.AssertionError, "You failed.");
    assert.equals(e2.name, "AssertionError");
    assert.equals(e2.innerError, e);
});
dntShim.Deno.test("ArgumentError", () => {
    const e = assert.throws(() => {
        mod_js_1.ArgumentError.throwIf(true, "myParam");
    }, mod_js_1.ArgumentError, "Argument myParam is invalid.");
    assert.equals(e.name, "ArgumentError");
    assert.exists(e.stack);
    assert.throws(() => {
        mod_js_1.ArgumentError.throwIf(true, "myParam", "BAD!");
    }, mod_js_1.ArgumentError, "BAD!");
    const e2 = assert.throws(() => {
        mod_js_1.ArgumentError.throwIf(true, "myParam", "BAD!", { innerError: e });
    }, mod_js_1.ArgumentError);
    assert.equals(e2.name, "ArgumentError");
    assert.equals(e2.innerError, e);
});
dntShim.Deno.test("ArgumentNullError", () => {
    const e = assert.throws(() => {
        mod_js_1.ArgumentNullError.throw(null, "myParam");
    }, mod_js_1.ArgumentNullError, "Argument myParam must not be null or undefined.");
    assert.equals(e.name, "ArgumentNullError");
    assert.exists(e.stack);
    assert.equals(e.parameterName, "myParam");
    assert.throws(() => {
        mod_js_1.ArgumentNullError.throw(undefined, "myParam", "BAD!");
    }, mod_js_1.ArgumentNullError, "BAD!");
    const e2 = assert.throws(() => {
        mod_js_1.ArgumentNullError.throw(null, "myParam2", "BAD!", { innerError: e });
    }, mod_js_1.ArgumentNullError);
    assert.equals(e2.name, "ArgumentNullError");
    assert.equals(e2.innerError, e);
    assert.equals(e2.parameterName, "myParam2");
});
dntShim.Deno.test("ArgumentEmptyError", () => {
    const e = assert.throws(() => {
        mod_js_1.ArgumentEmptyError.throw("", "myParam");
    }, mod_js_1.ArgumentEmptyError, "Argument myParam must not be null, undefined, or empty.");
    assert.equals(e.name, "ArgumentEmptyError");
    assert.exists(e.stack);
    assert.equals(e.parameterName, "myParam");
    assert.throws(() => {
        mod_js_1.ArgumentEmptyError.throw(undefined, "myParam", "BAD!");
    }, mod_js_1.ArgumentEmptyError, "BAD!");
    const e2 = assert.throws(() => {
        mod_js_1.ArgumentEmptyError.throw("", "myParam2", "BAD!", { innerError: e });
    }, mod_js_1.ArgumentEmptyError);
    assert.equals(e2.name, "ArgumentEmptyError");
    assert.equals(e2.innerError, e);
    assert.equals(e2.parameterName, "myParam2");
});
dntShim.Deno.test("ArgumentRangeError", () => {
    const e = assert.throws(() => {
        mod_js_1.ArgumentRangeError.throwIf(1 > 0, "myParam3");
    }, mod_js_1.ArgumentRangeError, "Argument myParam3 is out of range.");
    assert.equals(e.name, "ArgumentRangeError");
    assert.exists(e.stack);
    assert.equals(e.parameterName, "myParam3");
    assert.throws(() => {
        mod_js_1.ArgumentRangeError.throwIf(1 > 0, "myParam3", "BAD!");
    }, mod_js_1.ArgumentRangeError, "BAD!");
    const e2 = assert.throws(() => {
        mod_js_1.ArgumentRangeError.throwIf(1 > 0, "myParam3", "BAD!", { innerError: e });
    }, mod_js_1.ArgumentRangeError);
    assert.equals(e2.name, "ArgumentRangeError");
    assert.equals(e2.innerError, e);
    assert.equals(e2.parameterName, "myParam3");
});
dntShim.Deno.test("InvalidCastError", () => {
    const e = assert.throws(() => {
        mod_js_1.InvalidCastError.throw();
    }, mod_js_1.InvalidCastError, "Invalid cast.");
    assert.equals(e.name, "InvalidCastError");
    assert.exists(e.stack);
    assert.throws(() => {
        mod_js_1.InvalidCastError.throw("BAD!");
    }, mod_js_1.InvalidCastError, "BAD!");
    const e2 = assert.throws(() => {
        mod_js_1.InvalidCastError.throw("Unable to cast to string", { innerError: e });
    }, mod_js_1.InvalidCastError);
    assert.equals(e2.name, "InvalidCastError");
    assert.equals(e2.innerError, e);
});
dntShim.Deno.test("InvalidOperationError", () => {
    const e = assert.throws(() => {
        mod_js_1.InvalidOperationError.throw();
    }, mod_js_1.InvalidOperationError, "Invalid operation.");
    assert.equals(e.name, "InvalidOperationError");
    assert.exists(e.stack);
    assert.throws(() => {
        mod_js_1.InvalidOperationError.throw("BAD!");
    }, mod_js_1.InvalidOperationError, "BAD!");
    const e2 = assert.throws(() => {
        mod_js_1.InvalidOperationError.throw("Unable to cast to string", { innerError: e });
    }, mod_js_1.InvalidOperationError);
    assert.equals(e2.name, "InvalidOperationError");
    assert.equals(e2.innerError, e);
});
dntShim.Deno.test("NotSupportedError", () => {
    const e = assert.throws(() => {
        mod_js_1.NotSupportedError.throw();
    }, mod_js_1.NotSupportedError, "Operation is not supported.");
    assert.equals(e.name, "NotSupportedError");
    assert.exists(e.stack);
    assert.throws(() => {
        mod_js_1.NotSupportedError.throw("BAD!");
    }, mod_js_1.NotSupportedError, "BAD!");
    const e2 = assert.throws(() => {
        mod_js_1.NotSupportedError.throw("Unable to cast to string", { innerError: e });
    }, mod_js_1.NotSupportedError);
    assert.equals(e2.name, "NotSupportedError");
    assert.equals(e2.innerError, e);
});
dntShim.Deno.test("NotImplementedError", () => {
    const e = assert.throws(() => {
        mod_js_1.NotImplementedError.throw();
    }, mod_js_1.NotImplementedError, "Not implemented.");
    assert.equals(e.name, "NotImplementedError");
    assert.exists(e.stack);
    assert.throws(() => {
        mod_js_1.NotImplementedError.throw("BAD!");
    }, mod_js_1.NotImplementedError, "BAD!");
    const e2 = assert.throws(() => {
        mod_js_1.NotImplementedError.throw("Unable to cast to string", { innerError: e });
    }, mod_js_1.NotImplementedError);
    assert.equals(e2.name, "NotImplementedError");
    assert.equals(e2.innerError, e);
});
dntShim.Deno.test("FormatError", () => {
    const e = assert.throws(() => {
        mod_js_1.FormatError.throw();
    }, mod_js_1.FormatError, "Format error.");
    assert.equals(e.name, "FormatError");
    assert.exists(e.stack);
    assert.throws(() => {
        mod_js_1.FormatError.throw("BAD!");
    }, mod_js_1.FormatError, "BAD!");
    const e2 = assert.throws(() => {
        mod_js_1.FormatError.throw("Unable to cast to string", { innerError: e });
    }, mod_js_1.FormatError);
    assert.equals(e2.name, "FormatError");
    assert.equals(e2.innerError, e);
});
dntShim.Deno.test("ObjectDisposedError", () => {
    const e = assert.throws(() => {
        mod_js_1.ObjectDisposedError.throw();
    }, mod_js_1.ObjectDisposedError, "Object is disposed.");
    assert.equals(e.name, "ObjectDisposedError");
    assert.exists(e.stack);
    assert.throws(() => {
        mod_js_1.ObjectDisposedError.throw("BAD!");
    }, mod_js_1.ObjectDisposedError, "BAD!");
    const e2 = assert.throws(() => {
        mod_js_1.ObjectDisposedError.throw("Unable to cast to string", { innerError: e });
    }, mod_js_1.ObjectDisposedError);
    assert.equals(e2.name, "ObjectDisposedError");
    assert.equals(e2.innerError, e);
});
dntShim.Deno.test("NullReferenceError", () => {
    const e = assert.throws(() => {
        mod_js_1.NullReferenceError.throw(null);
    }, mod_js_1.NullReferenceError, "Null or undefined reference.");
    assert.equals(e.name, "NullReferenceError");
    assert.exists(e.stack);
    assert.throws(() => {
        mod_js_1.NullReferenceError.throw(undefined, "BAD!");
    }, mod_js_1.NullReferenceError, "BAD!");
    const e2 = assert.throws(() => {
        mod_js_1.NullReferenceError.throw(null, "Unable to cast to string", { innerError: e });
    }, mod_js_1.NullReferenceError);
    assert.equals(e2.name, "NullReferenceError");
    assert.equals(e2.innerError, e);
});
dntShim.Deno.test("TimeoutError", () => {
    const e = assert.throws(() => {
        mod_js_1.TimeoutError.throw();
    }, mod_js_1.TimeoutError, "Operation timed out.");
    assert.equals(e.name, "TimeoutError");
    assert.exists(e.stack);
    assert.throws(() => {
        mod_js_1.TimeoutError.throw("BAD!");
    }, mod_js_1.TimeoutError, "BAD!");
    const e2 = assert.throws(() => {
        mod_js_1.TimeoutError.throw("Unable to cast to string", { innerError: e });
    }, mod_js_1.TimeoutError);
    assert.equals(e2.name, "TimeoutError");
    assert.equals(e2.innerError, e);
});
dntShim.Deno.test("Error", () => {
    try {
        throw new Error("test error");
    }
    catch (e) {
        const stack = (0, mod_js_1.getStackTrace)(e);
        assert.instanceOf(stack, Array);
        assert.ok(stack.length > 0);
        // extension becomes js in npm
        assert.ok(stack[0].includes("mod_test"));
    }
});
class Test {
    testSystemError() {
        this.innerAction();
    }
    innerAction() {
        throw new mod_js_1.SystemError("test error");
    }
}
__decorate([
    (0, mod_js_1.hideFromStackTrace)()
], Test.prototype, "testSystemError", null);
dntShim.Deno.test("hideFromStackStace decorator hides the method from stackTrace", () => {
    const test = new Test();
    try {
        test.testSystemError();
    }
    catch (e) {
        assert.exists(e.stack);
        assert.notOk(e.stack.includes("testSystemError"));
    }
});
