import { assert } from "chai";
import { assertSubset } from "../test-utils.js";
import { peakpointService } from "./peakpoint-service.js";
import { testCategories, harzMountains, maggie, maggieCredentials, adminCredentials } from "../fixtures/fixtures.js";

const categories = new Array(testCategories.length);

suite("Category API tests", () => {
  setup(async () => {
    await peakpointService.clearAuth();

    // Admin: reset DB
    await peakpointService.authenticate(adminCredentials);
    await peakpointService.deleteAllCategories();
    await peakpointService.deleteAllUsers();

    // Seed categories as ADMIN (createCategory is admin-only)
    await peakpointService.authenticate(adminCredentials);
    for (let i = 0; i < testCategories.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      categories[i] = await peakpointService.createCategory(testCategories[i]);
    }

    // Switch to normal user for read tests
    await peakpointService.clearAuth();
    await peakpointService.createUser(maggie);
    await peakpointService.authenticate(maggieCredentials);
  });

  teardown(async () => {});

  test("get all categories", async () => {
    const returnedCategories = await peakpointService.getAllCategories();
    assert.equal(returnedCategories.length, categories.length);
    for (let i = 0; i < categories.length; i += 1) {
      assertSubset(categories[i], returnedCategories[i]);
    }
  });

  test("non-admin cannot create a category", async () => {
    try {
      await peakpointService.createCategory(harzMountains);
      assert.fail("Should not return a response");
    } catch (error) {
      assert.equal(error.response.data.statusCode, 403);
    }
  });

  test("admin can create a category", async () => {
    await peakpointService.authenticate(adminCredentials);
    const category = await peakpointService.createCategory(harzMountains);
    assertSubset(harzMountains, category);
    assert.isDefined(category._id);
    await peakpointService.authenticate(maggieCredentials);
  });

  test("delete all categories (admin)", async () => {
    await peakpointService.authenticate(adminCredentials);

    let returnedCategories = await peakpointService.getAllCategories();
    assert.equal(returnedCategories.length, categories.length);

    await peakpointService.deleteAllCategories();

    returnedCategories = await peakpointService.getAllCategories();
    assert.equal(returnedCategories.length, 0);

    await peakpointService.authenticate(maggieCredentials);
  });

  test("get a category", async () => {
    const returnedCategory = await peakpointService.getCategory(categories[0]._id);
    assert.deepEqual(categories[0], returnedCategory);
  });

  test("get a category - bad id", async () => {
    try {
      await peakpointService.getCategory("1234");
      assert.fail("Should not return a response");
    } catch (error) {
      assert(error.response.data.message === "No Category with this id");
      assert.equal(error.response.data.statusCode, 404);
    }
  });

  test("get a category - deleted category", async () => {
    await peakpointService.authenticate(adminCredentials);
    await peakpointService.deleteAllCategories();

    await peakpointService.authenticate(maggieCredentials);
    try {
      await peakpointService.getCategory(categories[0]._id);
      assert.fail("Should not return a response");
    } catch (error) {
      assert(error.response.data.message === "No Category with this id");
      assert.equal(error.response.data.statusCode, 404);
    }
  });

  test("delete a category - success (admin)", async () => {
    await peakpointService.authenticate(adminCredentials);

    await peakpointService.deleteCategoryById(categories[0]._id);

    const returnedCategories = await peakpointService.getAllCategories();
    assert.equal(returnedCategories.length, categories.length - 1);

    try {
      await peakpointService.getCategory(categories[0]._id);
      assert.fail("Should not return a response");
    } catch (error) {
      assert(error.response.data.message === "No Category with this id");
      assert.equal(error.response.data.statusCode, 404);
    }
  });

  test("delete a category - forbidden (non-admin)", async () => {
    try {
      await peakpointService.deleteCategoryById(categories[0]._id);
      assert.fail("Should not return a response");
    } catch (error) {
      assert.equal(error.response.status, 403);
    }
  });
});
