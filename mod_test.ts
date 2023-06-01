import * as assert from "https://deno.land/x/bearzsh_assertions@0.1.0/mod.ts";
import { 
    SystemError, 
    hideFromStackTrace, 
    ArgumentError, 
    ArgumentNullError,
    ArgumentRangeError,
    ArgumentEmptyError,
    FormatError,
    InvalidCastError,
    InvalidOperationError,
    NotSupportedError,
    NotImplementedError,
    NullReferenceError,
    ObjectDisposedError,
    TimeoutError,

} from './mod.ts'


Deno.test("SystemError should have correct name", () => {
  const error = new SystemError("test error");
  assert.equals(error.name, "SystemError");
});

Deno.test("SystemError should have correct message", () => {
  const message = "test error";
  const error = new SystemError(message);
  assert.equals(error.message, message);
});

Deno.test("SystemError should have correct innerError", () => {
  const innerError = new Error("inner error");
  const error = new SystemError("test error", { innerError });
  assert.equals(error.innerError, innerError);
});

Deno.test("SystemError should have correct data", () => {
  const data = { foo: "bar" };
  const error = new SystemError("test error");
  error.data = data;
  assert.equals(error.data, data);
});

Deno.test("SystemError should have correct link", () => {
  const link = "https://example.com";
  const error = new SystemError("test error");
  error.link = link;
  assert.equals(error.link, link);
});

Deno.test("SystemError should have correct stackTrace", () => {
  try {
    throw new SystemError("test error");
  } catch(e) {
     assert.ok(e.stackTrace.length > 3);
     assert.ok(e.stackTrace[0].includes("mod_test.ts"));
  }
});


Deno.test("ArgumentError", () => {
    const e = assert.throws(() =>{
        ArgumentError.throwIf(true, "myParam")
    },
    ArgumentError,
    "Argument myParam is invalid.");

    assert.equals(e.name, "ArgumentError");
    assert.exists(e.stack);

    assert.throws(() =>{
        ArgumentError.throwIf(true, "myParam", "BAD!")
    },
    ArgumentError,
    "BAD!");

    const e2 = assert.throws(() =>{
        ArgumentError.throwIf(true, "myParam", "BAD!",  { innerError: e })
    }, ArgumentError);

    assert.equals(e2.name, "ArgumentError");
    assert.equals(e2.innerError, e);
});


Deno.test("ArgumentNullError ", () => {
    const e = assert.throws(() =>{
        ArgumentNullError.throw(null, "myParam");
    },
    ArgumentNullError,
    "Argument myParam must not be null or undefined.");

    assert.equals(e.name, "ArgumentNullError");
    assert.exists(e.stack);
    assert.equals(e.parameterName, "myParam");

    assert.throws(() =>{
        ArgumentNullError.throw(undefined, "myParam", "BAD!")
    },
    ArgumentNullError,
    "BAD!");

    const e2 = assert.throws(() => {
        ArgumentNullError.throw(null, "myParam2", "BAD!", { innerError: e })
    }, ArgumentNullError);

    assert.equals(e2.name, "ArgumentNullError");
    assert.equals(e2.innerError, e);
    assert.equals(e2.parameterName, "myParam2");
});

Deno.test("ArgumentEmptyError ", () => {
    const e = assert.throws(() =>{
        ArgumentEmptyError.throw("", "myParam");
    },
    ArgumentEmptyError,
    "Argument myParam must not be null, undefined, or empty.");

    assert.equals(e.name, "ArgumentEmptyError");
    assert.exists(e.stack);
    assert.equals(e.parameterName, "myParam");

    assert.throws(() =>{
        ArgumentEmptyError.throw(undefined, "myParam", "BAD!")
    },
    ArgumentEmptyError,
    "BAD!");

    const e2 = assert.throws(() => {
        ArgumentEmptyError.throw('', "myParam2", "BAD!", { innerError: e })
    }, ArgumentEmptyError);

    assert.equals(e2.name, "ArgumentEmptyError");
    assert.equals(e2.innerError, e);
    assert.equals(e2.parameterName, "myParam2");
});

Deno.test("ArgumentRangeError ", () => {

    const e = assert.throws(() =>{
        ArgumentRangeError.throwIf(1 > 0, "myParam3");
    }
    , ArgumentRangeError,
    "Argument myParam3 is out of range.");

    assert.equals(e.name, "ArgumentRangeError");
    assert.exists(e.stack);
    assert.equals(e.parameterName, "myParam3");

    assert.throws(() =>{
        ArgumentRangeError.throwIf(1 > 0, "myParam3", "BAD!")
    }
    , ArgumentRangeError,
    "BAD!");

    const e2 = assert.throws(() => {
        ArgumentRangeError.throwIf(1 > 0, "myParam3", "BAD!", { innerError: e })
    }
    , ArgumentRangeError);

    assert.equals(e2.name, "ArgumentRangeError");
    assert.equals(e2.innerError, e);
    assert.equals(e2.parameterName, "myParam3");
});

Deno.test("InvalidCastError ", () => {

    const e = assert.throws(() =>{
        InvalidCastError.throw();
    }
    , InvalidCastError,
    "Invalid cast.");

    assert.equals(e.name, "InvalidCastError");
    assert.exists(e.stack);

    assert.throws(() =>{
        InvalidCastError.throw("BAD!")
    }
    , InvalidCastError,
    "BAD!");

    const e2 = assert.throws(() => {
        InvalidCastError.throw("Unable to cast to string", { innerError: e })
    }
    , InvalidCastError);

    assert.equals(e2.name, "InvalidCastError");
    assert.equals(e2.innerError, e);
});

Deno.test("InvalidOperationError ", () => {

    const e = assert.throws(() =>{
        InvalidOperationError.throw();
    }
    , InvalidOperationError,
    "Invalid operation.");

    assert.equals(e.name, "InvalidOperationError");
    assert.exists(e.stack);

    assert.throws(() =>{
        InvalidOperationError.throw("BAD!")
    }
    , InvalidOperationError,
    "BAD!");

    const e2 = assert.throws(() => {
        InvalidOperationError.throw("Unable to cast to string", { innerError: e })
    }
    , InvalidOperationError);

    assert.equals(e2.name, "InvalidOperationError");
    assert.equals(e2.innerError, e);
});

Deno.test("NotSupportedError ", () => {

    const e = assert.throws(() =>{
        NotSupportedError.throw();
    }
    , NotSupportedError,
    "Operation is not supported.");

    assert.equals(e.name, "NotSupportedError");
    assert.exists(e.stack);

    assert.throws(() =>{
        NotSupportedError.throw("BAD!")
    }
    , NotSupportedError,
    "BAD!");

    const e2 = assert.throws(() => {
        NotSupportedError.throw("Unable to cast to string", { innerError: e })
    }
    , NotSupportedError);

    assert.equals(e2.name, "NotSupportedError");
    assert.equals(e2.innerError, e);
});

Deno.test("NotImplementedError ", () => {

    const e = assert.throws(() =>{
        NotImplementedError.throw();
    }
    , NotImplementedError,
    "Not implemented.");

    assert.equals(e.name, "NotImplementedError");
    assert.exists(e.stack);

    assert.throws(() =>{
        NotImplementedError.throw("BAD!")
    }
    , NotImplementedError,
    "BAD!");

    const e2 = assert.throws(() => {
        NotImplementedError.throw("Unable to cast to string", { innerError: e })
    }
    , NotImplementedError);

    assert.equals(e2.name, "NotImplementedError");
    assert.equals(e2.innerError, e);
});

Deno.test("FormatError ", () => {

    const e = assert.throws(() =>{
        FormatError.throw();
    }
    , FormatError,
    "Format error.");

    assert.equals(e.name, "FormatError");
    assert.exists(e.stack);

    assert.throws(() =>{
        FormatError.throw("BAD!")
    }
    , FormatError,
    "BAD!");

    const e2 = assert.throws(() => {
        FormatError.throw("Unable to cast to string", { innerError: e })
    }
    , FormatError);

    assert.equals(e2.name, "FormatError");
    assert.equals(e2.innerError, e);
});


Deno.test("ObjectDisposedError ", () => {

    const e = assert.throws(() =>{
        ObjectDisposedError.throw();
    }
    , ObjectDisposedError,
    "Object is disposed.");

    assert.equals(e.name, "ObjectDisposedError");
    assert.exists(e.stack);

    assert.throws(() =>{
        ObjectDisposedError.throw("BAD!")
    }
    , ObjectDisposedError,
    "BAD!");

    const e2 = assert.throws(() => {
        ObjectDisposedError.throw("Unable to cast to string", { innerError: e })
    }
    , ObjectDisposedError);

    assert.equals(e2.name, "ObjectDisposedError");
    assert.equals(e2.innerError, e);
});




Deno.test("NullReferenceError ", () => {

    const e = assert.throws(() =>{
        NullReferenceError.throw(null);
    }
    , NullReferenceError,
    "Null or undefined reference.");

    assert.equals(e.name, "NullReferenceError");
    assert.exists(e.stack);

    assert.throws(() =>{
        NullReferenceError.throw(undefined, "BAD!")
    }
    , NullReferenceError,
    "BAD!");

    const e2 = assert.throws(() => {
        NullReferenceError.throw(null, "Unable to cast to string", { innerError: e })
    }
    , NullReferenceError);

    assert.equals(e2.name, "NullReferenceError");
    assert.equals(e2.innerError, e);
});

Deno.test("TimeoutError ", () => {

    const e = assert.throws(() =>{
        TimeoutError.throw();
    }
    , TimeoutError,
    "Operation timed out.");

    assert.equals(e.name, "TimeoutError");
    assert.exists(e.stack);

    assert.throws(() =>{
        TimeoutError.throw("BAD!")
    }
    , TimeoutError,
    "BAD!");

    const e2 = assert.throws(() => {
        TimeoutError.throw("Unable to cast to string", { innerError: e })
    }
    , TimeoutError);

    assert.equals(e2.name, "TimeoutError");
    assert.equals(e2.innerError, e);
});

class Test {
    @hideFromStackTrace()
    testSystemError() {
        this.innerAction();
    }

    innerAction() {
        throw new SystemError("test error");
    }
}

Deno.test("hideFromStackStace decorator hides the method from stackTrace", () => {

    const test = new Test();
    try {
        test.testSystemError();
    } catch(e) {
        assert.exists(e.stack);
        assert.notOk(e.stack.includes("testSystemError"));
    }
});
