import { assert } from "chai";
import { peakpointService } from "./peakpoint-service.js";
import { assertSubset } from "../test-utils.js";

import { maggie, watzmann, testPeaks, testCategories, harzMountains, taunusMountains } from "../fixtures/fixtures.js";

suite("Peakpoint API tests", () => {
  let user = null;

  setup(async () => {
    await peakpointService.deleteAllPeaks();
    await peakpointService.deleteAllUsers();
    user = await peakpointService.createUser(maggie);
    watzmann.userid = user._id;
    for(let i=0; i<testPeaks.length; i +=1){
      testPeaks[i].userid = user._id;
      // eslint-disable-next-line no-await-in-loop
      testPeaks[i] = await peakpointService.createPeak(testPeaks[i]);
    }
  });
  teardown(async () => {});

  test("create a peak point", async () => {
    const returnedPeak = await peakpointService.createPeak(watzmann);
    assertSubset(watzmann, returnedPeak);
    assert.isDefined(returnedPeak._id);
  });

  test("delete all peak points", async () => {
    let returnedPeaks = await peakpointService.getAllPeaks();
    assert.equal(returnedPeaks.length, testPeaks.length);
    await peakpointService.deleteAllPeaks();
    returnedPeaks = await peakpointService.getAllPeaks();
    assert.equal(returnedPeaks.length, 0);
  });

  test("get a peak point", async () => {
    const returnedPeak = await peakpointService.getPeak(testPeaks[0]._id);
    assert.deepEqual(returnedPeak, testPeaks[0]);
  });

  test("get a peak point - bad params", async () => {
    try {
      const returnedPeak = await peakpointService.getPeak("123");
      assert.fail("Should not return a response");
    } catch (error) {
      assert(error.response.data.message === "No Peak with this id");
      assert.equal(error.response.data.statusCode, 404);
    }
  });

  test("get a peak point - deleted peak", async () => {
    await peakpointService.deletePeak(testPeaks[0]._id);
    try {
      const returnedPeak = await peakpointService.getPeak(testPeaks[0]._id);
      assert.fail("Should not return a response");
    } catch (error) {
      assert(error.response.data.message === "No Peak with this id");
      assert.equal(error.response.data.statusCode, 404);
    }
  });

  test("delete one peak point", async () => {
    const peak = await peakpointService.createPeak(watzmann);
    const response = await peakpointService.deletePeak(peak._id);
    assert.equal(response.status, 204);
    try {
      const returnedPeak = await peakpointService.getPeak(peak._id);
      assert.fail("Should not return a response");
    } catch (error) {
      assert(error.response.data.message === "No Peak with this id");
      assert.equal(error.response.data.statusCode, 404);
    }
  });

  test("create multiple peak points", async () => {
    const peaks = await peakpointService.getAllPeaks();
    assert.equal(peaks.length, testPeaks.length);
  });

  test("delete peak point - bad id", async () => {
    try {
      const response = await peakpointService.deletePeak("bad-id");
      assert.fail("Should not return a response");
    } catch (error) {
      assert(error.response.data.message === "No Peak with this id");
      assert.equal(error.response.data.statusCode, 404);
    }
  });
});

suite("Peak API category tests", () => {
  let user;
  let catHarz;
  let catTaunus;

  setup(async () => {
    await peakpointService.deleteAllPeaks();
    await peakpointService.deleteAllUsers();
    await peakpointService.deleteAllCategories();

    user = await peakpointService.createUser(maggie);
    catHarz = await peakpointService.createCategory(harzMountains);
    catTaunus = await peakpointService.createCategory(taunusMountains);
  });

  test("create peak with category", async () => {
    watzmann.userid = user._id;
    watzmann.categoryIds = [catHarz._id];

    const createdPeak = await peakpointService.createPeak(watzmann);

    assert.isDefined(createdPeak._id);
    assert.equal(createdPeak.categoryIds.length, 1);
    assert.deepEqual(createdPeak.categoryIds[0], catHarz);
  });

  test("filter peaks by single category", async () => {
    await peakpointService.deleteAllPeaks();

    for (let i = 0; i < testPeaks.length; i += 1) {
      const peak = testPeaks[i];
      peak.userid = user._id;
      peak.categoryIds = [catHarz._id];
      // eslint-disable-next-line no-await-in-loop
      await peakpointService.createPeak(peak);
    }

    const peaks = await peakpointService.getAllPeaks({ categoryIds: catHarz._id });

    assert.equal(peaks.length, testPeaks.length);
    for (let i = 0; i < peaks.length; i += 1) {
      const returnedCat = peaks[i].categoryIds[0];
      assert.deepEqual(returnedCat, catHarz);
    }
  });

  test("filter peaks by multiple categories", async () => {
    await peakpointService.deleteAllPeaks();

    for (let i = 0; i < testPeaks.length; i += 1) {
      const peak = testPeaks[i];
      peak.userid = user._id;
      peak.categoryIds = [i % 2 === 0 ? catHarz._id : catTaunus._id];
      // eslint-disable-next-line no-await-in-loop
      await peakpointService.createPeak(peak);
    }

    const peaks = await peakpointService.getAllPeaks({
      categoryIds: `${catHarz._id  },${  catTaunus._id}`,
    });

    assert.equal(peaks.length, testPeaks.length);
  });

  test("filter peaks by unknown category", async () => {
    await peakpointService.deleteAllPeaks();

    const peaks = await peakpointService.getAllPeaks({
      categoryIds: "605c72ef4f1a25677c3e1b99",
    });

    assert.equal(peaks.length, 0);
  });
});
