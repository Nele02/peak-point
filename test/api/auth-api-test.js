import { assert } from "chai";
import { peakpointService } from "./peakpoint-service.js";
import { decodeToken } from "../../src/api/jwt-utils.js";
import { maggie, maggieCredentials, adminCredentials } from "../fixtures/fixtures.js";

suite("Authentication API tests", async () => {
  let response;
  let returnedUser;
  setup(async () => {
    await peakpointService.clearAuth();
    await peakpointService.authenticate(adminCredentials);
    await peakpointService.deleteAllUsers();
    returnedUser = await peakpointService.createUser(maggie);
    response = await peakpointService.authenticate(maggieCredentials);
  });

  test("authenticate", async () => {

    assert(response.success);
    assert.isDefined(response.token);
  });

  test("verify Token", async () => {
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
