import { updateLandingScreenBannerVisibility } from "../actions";

describe("updateLandingScreenBannerVisibility", () => {
  it("should properly construct the action", () => {
    const action = updateLandingScreenBannerVisibility({
      id: "ITW_DISCOVERY",
      enabled: true
    });
    expect(action.type).toBe("UPDATE_HOME_SCREEN_BANNER_STATE");
    expect(action.payload).toEqual({ id: "ITW_DISCOVERY", enabled: true });
  });
});
