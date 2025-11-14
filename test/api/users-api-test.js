import { assert } from "chai";
import { assertSubset } from "../test-utils.js";
import { peakpointService } from "./peakpoint-service.js";
import { maggie, testUsers } from "../fixtures/fixtures.js";

suite("User API tests", () => {
  setup(async () => {
    await peakpointService.deleteAllUsers();
    for (let i = 0; i < testUsers.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      testUsers[0] = await peakpointService.createUser(testUsers[i]);
    }
  });
  teardown(async () => {});

  test("create a user", async () => {
    const newUser = await peakpointService.createUser(maggie);
    assertSubset(maggie, newUser);
    assert.isDefined(newUser._id);
  });

  test("delete all userApi", async () => {
    let returnedUsers = await peakpointService.getAllUsers();
    assert.equal(returnedUsers.length, testUsers.length);
    await peakpointService.deleteAllUsers();
    returnedUsers = await peakpointService.getAllUsers();
    assert.equal(returnedUsers.length, 0);
  });

  test("get a user", async () => {
    const returnedUser = await peakpointService.getUser(testUsers[0]._id);
    assert.deepEqual(testUsers[0], returnedUser);
  });

  test("get a user - bad id", async () => {
    try {
      const returnedUser = await peakpointService.getUser("1234");
      assert.fail("Should not return a response");
    } catch (error) {
      assert(error.response.data.message === "No User with this id");
      assert.equal(error.response.data.statusCode, 404);
    }
  });

  test("get a user - deleted user", async () => {
    await peakpointService.deleteAllUsers();
    try {
      const returnedUser = await peakpointService.getUser(testUsers[0]._id);
      assert.fail("Should not return a response");
    } catch (error) {
      assert(error.response.data.message === "No User with this id");
      assert.equal(error.response.data.statusCode, 404);
    }
  });

  test("delete a user - success", async () => {
    await peakpointService.deleteUserById(testUsers[0]._id);
    const returnedUsers = await peakpointService.getAllUsers();
    assert.equal(returnedUsers.length, testUsers.length - 1);
    try {
      const returnedUser = await peakpointService.getUser(testUsers[0]._id);
      assert.fail("Should not return a response");
    } catch (error) {
      assert(error.response.data.message === "No User with this id");
      assert.equal(error.response.data.statusCode, 404);
    }
  });

  test("delete a user - bad id", async () => {
    try {
      await peakpointService.deleteUserById("1234");
    } catch (error) {
      assert(error.response.data.message === "No User with this id");
      assert.equal(error.response.data.statusCode, 404);
    }
  });
});