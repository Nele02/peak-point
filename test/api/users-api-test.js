import { assert } from "chai";
import { assertSubset } from "../test-utils.js";
import { peakpointService } from "./peakpoint-service.js";
import { maggie, maggieCredentials, testUsers, adminCredentials, lisa } from "../fixtures/fixtures.js";

const users = new Array(testUsers.length);

suite("User API tests", () => {
  let maggieAuth = null;

  setup(async () => {
    await peakpointService.clearAuth();

    // Admin: clean DB
    await peakpointService.authenticate(adminCredentials);
    await peakpointService.deleteAllUsers();

    // Seed users
    await peakpointService.createUser(maggie);
    for (let i = 0; i < testUsers.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      users[i] = await peakpointService.createUser(testUsers[i]);
    }

    // Switch to normal user
    maggieAuth = await peakpointService.authenticate(maggieCredentials);
  });

  teardown(async () => {});

  test("create a user", async () => {
    const newUser = await peakpointService.createUser(lisa);
    assertSubset({ firstName: "Lisa", lastName: "Simpson", email: "lisa@simpson.com" }, newUser);
    assert.isDefined(newUser._id);
  });

  test("non-admin cannot list all users", async () => {
    try {
      await peakpointService.getAllUsers();
      assert.fail("Should not return a response");
    } catch (error) {
      assert.equal(error.response.data.statusCode, 403);
    }
  });

  test("admin can list all users", async () => {
    await peakpointService.authenticate(adminCredentials);
    const returnedUsers = await peakpointService.getAllUsers();
    assert.isAtLeast(returnedUsers.length, users.length + 1);
  });

  test("user can get their own profile", async () => {
    const returnedUser = await peakpointService.getUser(maggieAuth._id);
    assert.equal(returnedUser.email, maggie.email);
    assert.equal(returnedUser.firstName, maggie.firstName);
    assert.equal(returnedUser.lastName, maggie.lastName);
  });

  test("user cannot get another user's profile", async () => {
    try {
      await peakpointService.getUser(users[0]._id);
      assert.fail("Should not return a response");
    } catch (error) {
      assert.equal(error.response.data.statusCode, 403);
    }
  });

  test("admin can get a specific user", async () => {
    await peakpointService.authenticate(adminCredentials);
    const returnedUser = await peakpointService.getUser(users[0]._id);
    assert.deepEqual(users[0], returnedUser);
  });

  test("non-admin get user with bad id -> forbidden (no enumeration)", async () => {
    try {
      await peakpointService.getUser("1234");
      assert.fail("Should not return a response");
    } catch (error) {
      assert.equal(error.response.data.statusCode, 403);
    }
  });

  test("admin get user with bad id -> not found", async () => {
    await peakpointService.authenticate(adminCredentials);
    try {
      await peakpointService.getUser("1234");
      assert.fail("Should not return a response");
    } catch (error) {
      assert.equal(error.response.data.message, "No User with this id");
      assert.equal(error.response.data.statusCode, 404);
    }
  });

  test("non-admin cannot delete another user", async () => {
    try {
      await peakpointService.deleteUserById(users[0]._id);
      assert.fail("Should not return a response");
    } catch (error) {
      assert.equal(error.response.data.statusCode, 403);
    }
  });

  test("admin can delete a user", async () => {
    await peakpointService.authenticate(adminCredentials);

    await peakpointService.deleteUserById(users[0]._id);

    const returnedUsers = await peakpointService.getAllUsers();
    assert.isAtLeast(returnedUsers.length, users.length); // one removed, admin + maggie remain etc.

    try {
      await peakpointService.getUser(users[0]._id);
      assert.fail("Should not return a response");
    } catch (error) {
      assert.equal(error.response.data.message, "No User with this id");
      assert.equal(error.response.data.statusCode, 404);
    }
  });

  test("admin can delete all users", async () => {
    await peakpointService.authenticate(adminCredentials);
    await peakpointService.deleteAllUsers();

    await peakpointService.createUser(maggie);
    maggieAuth = await peakpointService.authenticate(maggieCredentials);

    await peakpointService.authenticate(adminCredentials);
    const returnedUsers = await peakpointService.getAllUsers();
    assert.isAtLeast(returnedUsers.length, 1);
  });
});
