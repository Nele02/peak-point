import { assert } from "chai";
import { peakpointService } from "./peakpoint-service.js";
import { assertSubset } from "../test-utils.js";

import {
  maggie,
  watzmann,
  testPeaks,
  harzMountains,
  taunusMountains,
  maggieCredentials,
  adminCredentials,
} from "../fixtures/fixtures.js";

suite("Peakpoint API tests", () => {
  let user = null;
  const peaks = new Array(testPeaks.length);

  setup(async () => {
    await peakpointService.clearAuth();

    // Admin: reset
    await peakpointService.authenticate(adminCredentials);
    await peakpointService.deleteAllPeaks();
    await peakpointService.deleteAllUsers();

    // create normal user
    await peakpointService.clearAuth();
    user = await peakpointService.createUser(maggie);

    // normal user auth for most tests
    await peakpointService.authenticate(maggieCredentials);

    // seed peaks (userid in payload is ignored by backend now; still okay to pass)
    for (let i = 0; i < testPeaks.length; i += 1) {
      const p = { ...testPeaks[i] }; // clone
      // eslint-disable-next-line no-await-in-loop
      peaks[i] = await peakpointService.createPeak(p);
    }
  });

  teardown(async () => {});

  test("create a peak point", async () => {
    const payload = { ...watzmann, userid: "some-other-userid" };
    const returnedPeak = await peakpointService.createPeak(payload);

    assert.isDefined(returnedPeak._id);
    assertSubset(watzmann, returnedPeak);
  });

  test("update a peak point (owner)", async () => {
    const original = peaks[0];

    const updatePayload = {
      name: `${original.name} UPDATED`,
      description: "Updated description",
      elevation: (original.elevation || 0) + 1,
      lat: (original.lat || 0) + 0.0001,
      lng: (original.lng || 0) + 0.0001,
    };

    const updated = await peakpointService.updatePeak(original._id, updatePayload);

    assert.equal(updated._id, original._id);
    assert.equal(updated.name, updatePayload.name);
    assert.equal(updated.description, updatePayload.description);
    assert.equal(updated.elevation, updatePayload.elevation);
    assert.equal(updated.lat, updatePayload.lat);
    assert.equal(updated.lng, updatePayload.lng);

    const fetched = await peakpointService.getPeak(original._id);
    assert.equal(fetched.name, updatePayload.name);
    assert.equal(fetched.description, updatePayload.description);
  });

  test("update a peak point - bad id", async () => {
    try {
      await peakpointService.updatePeak("1234", { name: "X" });
      assert.fail("Should not return a response");
    } catch (error) {
      assert.equal(error.response.data.message, "No Peak with this id");
      assert.equal(error.response.data.statusCode, 404);
    }
  });

  test("delete all peak points - forbidden for non-admin", async () => {
    try {
      await peakpointService.deleteAllPeaks();
      assert.fail("Should not return a response");
    } catch (error) {
      assert.equal(error.response.data.statusCode, 403);
    }
  });

  test("delete all peak points - admin success", async () => {
    // switch to admin
    await peakpointService.authenticate(adminCredentials);

    let returnedPeaks = await peakpointService.getAllPeaks();
    assert.equal(returnedPeaks.length, peaks.length);

    await peakpointService.deleteAllPeaks();

    returnedPeaks = await peakpointService.getAllPeaks();
    assert.equal(returnedPeaks.length, 0);
  });

  test("get a peak point", async () => {
    const returnedPeak = await peakpointService.getPeak(peaks[0]._id);
    assert.deepEqual(returnedPeak, peaks[0]);
  });

  test("get a peak point - bad params", async () => {
    try {
      await peakpointService.getPeak("123");
      assert.fail("Should not return a response");
    } catch (error) {
      assert.equal(error.response.data.message, "No Peak with this id");
      assert.equal(error.response.data.statusCode, 404);
    }
  });

  test("get a peak point - deleted peak", async () => {
    await peakpointService.deletePeak(peaks[0]._id);
    try {
      await peakpointService.getPeak(peaks[0]._id);
      assert.fail("Should not return a response");
    } catch (error) {
      assert.equal(error.response.data.message, "No Peak with this id");
      assert.equal(error.response.data.statusCode, 404);
    }
  });

  test("delete one peak point (owner)", async () => {
    const peak = await peakpointService.createPeak({ ...watzmann });
    const response = await peakpointService.deletePeak(peak._id);
    assert.equal(response.status, 204);

    try {
      await peakpointService.getPeak(peak._id);
      assert.fail("Should not return a response");
    } catch (error) {
      assert.equal(error.response.data.message, "No Peak with this id");
      assert.equal(error.response.data.statusCode, 404);
    }
  });

  test("create multiple peak points", async () => {
    const returnedPeaks = await peakpointService.getAllPeaks();
    assert.equal(returnedPeaks.length, peaks.length);
  });

  test("delete peak point - bad id", async () => {
    try {
      await peakpointService.deletePeak("bad-id");
      assert.fail("Should not return a response");
    } catch (error) {
      assert.equal(error.response.data.message, "No Peak with this id");
      assert.equal(error.response.data.statusCode, 404);
    }
  });

  test("get peaks for logged-in user (self)", async () => {
    const userPeaks = await peakpointService.getUserPeaks(user._id);

    assert.equal(userPeaks.length, peaks.length);
    for (let i = 0; i < userPeaks.length; i += 1) {
      assert.equal(String(userPeaks[i].userid), String(user._id));
    }
  });

  test("user cannot get peaks for another user", async () => {
    // create another user
    await peakpointService.clearAuth();
    const other = await peakpointService.createUser({
      firstName: "Other",
      lastName: "User",
      email: "other@example.com",
      password: "secret",
    });

    // back to maggie
    await peakpointService.authenticate(maggieCredentials);

    try {
      await peakpointService.getUserPeaks(other._id);
      assert.fail("Should not return a response");
    } catch (error) {
      assert.equal(error.response.data.statusCode, 403);
    }
  });

  test("admin can get peaks for any user", async () => {
    await peakpointService.authenticate(adminCredentials);
    const userPeaks = await peakpointService.getUserPeaks(user._id);
    assert.isArray(userPeaks);
    assert.isAtLeast(userPeaks.length, 0);

    await peakpointService.authenticate(maggieCredentials);
  });

  test("get peaks for user with no peaks", async () => {
    await peakpointService.authenticate(adminCredentials);
    await peakpointService.deleteAllPeaks();

    await peakpointService.authenticate(maggieCredentials);
    const userPeaks = await peakpointService.getUserPeaks(user._id);
    assert.isArray(userPeaks);
    assert.equal(userPeaks.length, 0);
  });
});

suite("Peak API filter category tests", () => {
  let user;
  let catHarz;
  let catTaunus;

  setup(async () => {
    await peakpointService.clearAuth();

    // Admin reset
    await peakpointService.authenticate(adminCredentials);
    await peakpointService.deleteAllPeaks();
    await peakpointService.deleteAllCategories();
    await peakpointService.deleteAllUsers();

    // create categories as admin
    await peakpointService.authenticate(adminCredentials);
    catHarz = await peakpointService.createCategory(harzMountains);
    catTaunus = await peakpointService.createCategory(taunusMountains);


    // back to normal user
    await peakpointService.clearAuth();
    user = await peakpointService.createUser(maggie);
    await peakpointService.authenticate(maggieCredentials);
  });

  // seed peaks for with alternating categories
  async function seedUserPeaks() {
    for (let i = 0; i < testPeaks.length; i += 1) {
      const p = { ...testPeaks[i] };
      p.userid = user._id;
      p.categories = i % 2 === 0 ? catHarz._id : catTaunus._id;
      // eslint-disable-next-line no-await-in-loop
      await peakpointService.createPeak(p);
    }
  }

  test("create peak with one category", async () => {
    watzmann.userid = user._id;
    watzmann.categories = catHarz._id;
    const createdPeak = await peakpointService.createPeak(watzmann);

    assert.isDefined(createdPeak._id);
    assert.equal(createdPeak.categories.length, 1);
    assert.deepEqual(createdPeak.categories[0], catHarz);
  });

  test("create peak with multiple categories", async () => {
    const payload = { ...watzmann, categories: [catHarz._id, catTaunus._id] };
    const createdPeak = await peakpointService.createPeak(payload);

    assert.isDefined(createdPeak._id);
    assert.deepEqual(createdPeak.categories, [catHarz, catTaunus]);
  });

  test("filter peaks by single category", async () => {
    for (let i = 0; i < testPeaks.length; i += 1) {
      const p = { ...testPeaks[i], categories: [catHarz._id] };
      // eslint-disable-next-line no-await-in-loop
      await peakpointService.createPeak(p);
    }

    const returnedPeaks = await peakpointService.getAllPeaks({ categoryIds: catHarz._id });

    assert.equal(returnedPeaks.length, testPeaks.length);
    for (let i = 0; i < returnedPeaks.length; i += 1) {
      const returnedCat = returnedPeaks[i].categories[0];
      assert.deepEqual(returnedCat, catHarz);
    }
  });

  test("filter peaks by multiple categories", async () => {
    for (let i = 0; i < testPeaks.length; i += 1) {
      const peak = testPeaks[i];
      peak.userid = user._id;
      peak.categories = i % 2 === 0 ? catHarz._id : catTaunus._id;
      // eslint-disable-next-line no-await-in-loop
      await peakpointService.createPeak(peak);
    }

    const returned = await peakpointService.getAllPeaks({
      categoryIds: [catHarz._id, catTaunus._id],
    });

    assert.equal(returned.length, testPeaks.length);
  });

  test("filter peaks by unknown category", async () => {
    const returned = await peakpointService.getAllPeaks({
      categoryIds: "605c72ef4f1a25677c3e1b99",
    });

    assert.equal(returned.length, 0);
  });

  test("filter logged-in user's peaks by single category", async () => {
    await seedUserPeaks();

    const filtered = await peakpointService.getUserPeaks(user._id, { categoryIds: [catHarz._id] });

    assert.isArray(filtered);
    assert.isAtLeast(filtered.length, 1);

    for (let i = 0; i < filtered.length; i += 1) {
      assert.equal(String(filtered[i].userid), String(user._id));
      assert.equal(String(filtered[i].categories[0]._id), String(catHarz._id));
    }
  });

  test("filter logged-in user's peaks by multiple categories", async () => {
    await peakpointService.authenticate(adminCredentials);
    await peakpointService.deleteAllPeaks();
    await peakpointService.clearAuth();
    await peakpointService.authenticate(maggieCredentials);

    await seedUserPeaks();

    const filtered = await peakpointService.getUserPeaks(user._id, {
      categoryIds: [catHarz._id, catTaunus._id],
    });

    assert.isArray(filtered);
    assert.equal(filtered.length, testPeaks.length);
  });
});
