import { assert } from "chai";
import { peakpointService } from "./peakpoint-service.js";
import { maggie, watzmann } from "../fixtures/fixtures.js";

suite("Peakpoint Image API tests", () => {
  let user = null;
  let peak = null;

  setup(async () => {
    await peakpointService.deleteAllPeaks();
    await peakpointService.deleteAllUsers();

    user = await peakpointService.createUser(maggie);

    watzmann.userid = user._id;
    peak = await peakpointService.createPeak(watzmann);
  });

  teardown(async () => {});

  test("upload images for a peak point", async () => {
    const updatedPeak = await peakpointService.uploadPeakImages(peak._id,"test/fixtures/test-image.png");

    assert.isDefined(updatedPeak._id);
    assert.equal(updatedPeak._id, peak._id);

    assert.isDefined(updatedPeak.images);
    assert.isArray(updatedPeak.images);
    assert.equal(updatedPeak.images.length, 1);
    assert.match(updatedPeak.images[0], /^\/public\//);
  });

  test("upload images for a peak point - bad peak id", async () => {
    try {
      const updatedPeak = await peakpointService.uploadPeakImages("1234","test/fixtures/test-image.png");
      assert.fail("Should not return a response");
    } catch (error) {
      assert(error.response.data.message === "No Peak with this id");
      assert.equal(error.response.data.statusCode, 404);
    }
  });

});
