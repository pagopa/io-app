import { assetsFolder } from "../../config";
import { readFileAsJSON } from "../../utils/file";

// test added beacuse CI did not catch malformed json file
it("should return bonus_available_v2.json", async () => {
  await readFileAsJSON(
    assetsFolder + "/bonus_available/bonus_available_v2.json"
  );
});
