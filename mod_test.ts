import * as assert from "https://deno.land/x/bearzsh_assertions@0.1.0/mod.ts";
import { SystemError } from './mod.ts'

Deno.test("system error properties", () => {
    const error = new SystemError("test error");
    assert.equals(error.name, "SystemError")
    assert.equals(error.message, "test error")
    assert.exists(error.stack);
    assert.exists(error.stackTrace);
    assert.ok(error.stackTrace.length > 3);

    const error2 = new SystemError("test error 2", error);
    assert.equals(error2.name, "SystemError")
    assert.equals(error2.message, "test error 2")
    assert.exists(error2.innerError);
    assert.equals(error2.innerError, error);
});