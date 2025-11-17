import { assert } from "chai";
import { db } from "../../src/models/db.js";
import { testPeaks, watzmann, testCategories, harzMountains, taunusMountains, maggie, testUsers } from "../fixtures/fixtures.js";
import { assertSubset } from "../test-utils.js";

suite("Peak Model tests", () => {
  setup(async () => {
    db.init("mongo");
    await db.peakStore.deleteAll();
    await db.categoryStore.deleteAll();
    await db.userStore.deleteAll();
    for (let i = 0; i < testPeaks.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      const user = await db.userStore.addUser(testUsers[i]);
      testPeaks[i].userid = user._id;
      // eslint-disable-next-line no-await-in-loop
      testPeaks[i] = await db.peakStore.addPeak(testPeaks[i]);
    }
  });

  test("create a peak", async () => {
    const user = await db.userStore.addUser(maggie);
    watzmann.userid = user._id;
    const peak = await db.peakStore.addPeak(watzmann);
    assertSubset(watzmann, peak);
    assert.isDefined(peak._id);
  });

  test("delete all peaks", async () => {
    let returnedPeaks = await db.peakStore.getAllPeaks();
    assert.equal(returnedPeaks.length, testPeaks.length);
    await db.peakStore.deleteAll();
    returnedPeaks = await db.peakStore.getAllPeaks();
    assert.equal(returnedPeaks.length, 0);
  });

  test("get a peak - success", async () => {
    const peak = await db.peakStore.addPeak(watzmann);
    const returnedPeak = await db.peakStore.getPeakById(peak._id);
    assertSubset(watzmann, returnedPeak);
  });

  test("delete One Peak - success", async () => {
    const id = testPeaks[0]._id;
    await db.peakStore.deletePeakById(id);
    const returnedPeaks = await db.peakStore.getAllPeaks();
    assert.equal(returnedPeaks.length, testPeaks.length - 1);
    const deletedPeak = await db.peakStore.getPeakById(id);
    assert.isNull(deletedPeak);
  });

  test("get a peak - bad params", async () => {
    assert.isNull(await db.peakStore.getPeakById("123"));
    assert.isNull(await db.peakStore.getPeakById(""));
    assert.isNull(await db.peakStore.getPeakById());
  });

  test("delete One Peak - fail", async () => {
    await db.peakStore.deletePeakById("bad-id");
    const allPeaks = await db.peakStore.getAllPeaks();
    assert.equal(testPeaks.length, allPeaks.length);
  });
});

suite("Peak Model category tests", () => {
  let user;

  setup(async () => {
    db.init("mongo");
    await db.peakStore.deleteAll();
    await db.categoryStore.deleteAll();
    await db.userStore.deleteAll();
    user = await db.userStore.addUser(maggie);
  });

  test("add peak with categories", async () => {
    const categories = [];
    const categoryIds = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const category of testCategories) {
      // eslint-disable-next-line no-await-in-loop
      const returnedCategory = await db.categoryStore.addCategory(category);
      categories.push(returnedCategory);
      categoryIds.push(returnedCategory._id);
    }
    watzmann.userid = user._id;
    watzmann.categories = categoryIds;
    const returnedPeak = await db.peakStore.addPeak(watzmann);

    assert.isDefined(returnedPeak._id);
    watzmann.categoryIds = categories;
    assertSubset(returnedPeak, watzmann);
  });

  test("get peaks by category - one peak", async () => {
    const category = await db.categoryStore.addCategory(harzMountains);
    watzmann.userid = user._id;
    watzmann.categories = category._id;
    const returnedPeak = await db.peakStore.addPeak(watzmann);

    const peaks = await db.peakStore.getPeaksByCategory(category._id);
    assert.equal(peaks.length, 1);
    assert.deepEqual(peaks[0].categories[0], category);
  });

  test("get peaks by category - multiple peaks", async () => {
    const category = await db.categoryStore.addCategory(harzMountains);

    await db.peakStore.deleteAll();
    // eslint-disable-next-line no-restricted-syntax
    for (const peak of testPeaks) {
      peak.categories = category._id;
      peak.userid = user._id;
      // eslint-disable-next-line no-await-in-loop
      await db.peakStore.addPeak(peak);
    }

    const morePeaks = await db.peakStore.getPeaksByCategory(category._id);
    assert.equal(morePeaks.length, testPeaks.length);
  });

  test("filter peaks by multiple categories", async () => {
    const category1 = await db.categoryStore.addCategory(harzMountains);
    const category2 = await db.categoryStore.addCategory(taunusMountains);

    await db.peakStore.deleteAll();
    // eslint-disable-next-line no-restricted-syntax
    for (const peak of testPeaks) {
      peak.categories = [category1._id, category2._id];
      peak.userid = user._id;
      // eslint-disable-next-line no-await-in-loop
      await db.peakStore.addPeak(peak);
    }

    watzmann.userid = user._id;
    watzmann.categories = category2._id;
    await db.peakStore.addPeak(watzmann);

    const peaksCategory1 = await db.peakStore.getPeaksByCategory(category1._id);
    assert.equal(peaksCategory1.length, testPeaks.length);
    // assertSubset(testPeaks, peaksCategory1);

    const peaksCategory2 = await db.peakStore.getPeaksByCategory(category2._id);
    assert.equal(peaksCategory2.length, testPeaks.length + 1);

    const peaksBothCategories = await db.peakStore.getPeaksByCategory([category1._id, category2._id]);
    assert.equal(peaksBothCategories.length, testPeaks.length + 1);
  });

  test("get peaks by category - no category", async () => {
    const peaks = await db.peakStore.getPeaksByCategory("605c72ef4f1a25677c3e1b99");
    assert.equal(peaks.length, 0);
  });
});