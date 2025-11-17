import { assert } from "chai";
import { peakpointService } from "./peakpoint-service.js";
import { decodeToken } from "../../src/api/jwt-utils.js";
import { maggie, maggieCredentials } from "../fixtures/fixtures.js";

suite("Authentication API tests", async () => {
  setup(async () => {
    await peakpointService.clearAuth();
    await peakpointService.createUser(maggie);
    await peakpointService.authenticate(maggieCredentials);
    await peakpointService.deleteAllUsers();
  });

  test("authenticate", async () => {
    const returnedUser = await peakpointService.createUser(maggie);
    const response = await peakpointService.authenticate(maggieCredentials);
    assert(response.success);
    assert.isDefined(response.token);
  });

  test("verify Token", async () => {
    const returnedUser = await peakpointService.createUser(maggie);
    const response = await peakpointService.authenticate(maggieCredentials);

    const userInfo = decodeToken(response.token);
    assert.equal(userInfo.email, returnedUser.email);
    assert.equal(userInfo.userId, returnedUser._id);
  });

  test("check Unauthorized", async () => {
    await peakpointService.clearAuth();
    try {
      await peakpointService.deleteAllUsers();
      assert.fail("Route not protected");
    } catch (error) {
      assert.equal(error.response.data.statusCode, 401);
    }
  });

});
