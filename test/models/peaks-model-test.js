import { assert } from "chai";
import { db } from "../../src/models/db.js";
import { testPeaks, watzmann } from "../fixtures.js";
import { assertSubset } from "../test-utils.js";

suite("Peak Model tests", () => {
  setup(async () => {
    db.init("mongo");
    await db.peakStore.deleteAll();
    for (let i = 0; i < testPeaks.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      testPeaks[i] = await db.peakStore.addPeak(testPeaks[i]);
    }
  });

  test("create a peak", async () => {
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