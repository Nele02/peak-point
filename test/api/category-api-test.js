import { assert } from "chai";
import { assertSubset } from "../test-utils.js";
import { peakpointService } from "./peakpoint-service.js";
import { testCategories, harzMountains } from "../fixtures/fixtures.js";

const categories = new Array(testCategories.length);

suite("Category API tests", () => {
  setup(async () => {
    await peakpointService.deleteAllCategories();
    for (let i = 0; i < testCategories.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      categories[i] = await peakpointService.createCategory(testCategories[i]);
    }
  });

  teardown(async () => {});

  test("create a category", async () => {
    const category = await peakpointService.createCategory(harzMountains);
    assertSubset(harzMountains, category);
    assert.isDefined(category._id);
  });

  test("delete all categories", async () => {
    let returnedCategories = await peakpointService.getAllCategories();
    assert.equal(returnedCategories.length, categories.length);
    await peakpointService.deleteAllCategories();
    returnedCategories = await peakpointService.getAllCategories();
    assert.equal(returnedCategories.length, 0);
  });

  test("get a category", async () => {
    const returnedCategory = await peakpointService.getCategory(categories[0]._id);
    assert.deepEqual(categories[0], returnedCategory);
  });

  test("get a category - bad id", async () => {
    try {
      const returnedCategory = await peakpointService.getCategory("1234");
      assert.fail("Should not return a response");
    } catch (error) {
      assert(error.response.data.message === "No Category with this id");
      assert.equal(error.response.data.statusCode, 404);
    }
  });

  test("get a category - deleted category", async () => {
    await peakpointService.deleteAllCategories();
    try {
      const returnedCategory = await peakpointService.getCategory(categories[0]._id);
      assert.fail("Should not return a response");
    } catch (error) {
      assert(error.response.data.message === "No Category with this id");
      assert.equal(error.response.data.statusCode, 404);
    }
  });

  test("delete a category - success", async () => {
    await peakpointService.deleteCategoryById(categories[0]._id);
    const returnedCategories = await peakpointService.getAllCategories();
    assert.equal(returnedCategories.length, categories.length - 1);
    try {
      const returnedCategory = await peakpointService.getCategory(categories[0]._id);
      assert.fail("Should not return a response");
    } catch (error) {
      assert(error.response.data.message === "No Category with this id");
      assert.equal(error.response.data.statusCode, 404);
    }
  });

});