import { LandingScreenBannerId } from "../../utils/landingScreenBannerMap";
import { updateLandingScreenBannerVisibility } from "../actions";

const testCases = [
  {
    id: "ITW_DISCOVERY",
    enabled: true
  },
  {
    id: "NON_MAPPED_ID",
    enabled: true
  },
  {
    id: "ITW_DISCOVERY",
    enabled: false
  },
  {
    id: "NON_MAPPED_ID",
    enabled: false
  }
] as Array<{
  id: LandingScreenBannerId;
  enabled: boolean;
}>;

describe("updateLandingScreenBannerVisibility", () => {
  for (const testCase of testCases) {
    it(`should create ${testCase.enabled ? "enable" : "disable"} banner ${
      testCase.id
    } action `, () => {
      expect(updateLandingScreenBannerVisibility(testCase)).toEqual({
        type: "UPDATE_LANDING_SCREEN_BANNER_STATE",
        payload: {
          id: testCase.id,
          enabled: testCase.enabled
        }
      });
    });
  }
});
