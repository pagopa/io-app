import { applicationChangeState } from "../../../../store/actions/application";
import { LandingScreenBannerId } from "../../utils/landingScreenBannerMap";
import { updateLandingScreenBannerVisibility } from "../actions";
import {
  landingScreenBannersReducer,
  LandingScreenBannerState
} from "../reducer";

describe("landingScreenBannersReducer", () => {
  it("should match snapshot", () => {
    expect(
      landingScreenBannersReducer(undefined, applicationChangeState("active"))
    ).toMatchSnapshot("undefined_no_action");
  });
  it("should update state on action received -- enabled:false", () => {
    const baseState = {
      "banner-1": true
    } as unknown as LandingScreenBannerState;
    const action = updateLandingScreenBannerVisibility({
      enabled: false,
      id: "banner-1" as LandingScreenBannerId
    });

    const reducer = landingScreenBannersReducer(baseState, action);
    expect(reducer).toEqual({
      "banner-1": false
    });
  });
  it("should update state on action received -- enabled:true", () => {
    const baseState = {
      "banner-1": false
    } as unknown as LandingScreenBannerState;
    const action = updateLandingScreenBannerVisibility({
      enabled: true,
      id: "banner-1" as LandingScreenBannerId
    });

    const reducer = landingScreenBannersReducer(baseState, action);
    expect(reducer).toEqual({
      "banner-1": true
    });
  });
  it("should not update state on invalid action received -- invalid id", () => {
    const baseState = {
      "banner-1": false
    } as unknown as LandingScreenBannerState;
    const action = updateLandingScreenBannerVisibility({
      enabled: true,
      id: "banner-5" as LandingScreenBannerId
    });

    const reducer = landingScreenBannersReducer(baseState, action);
    expect(reducer).toEqual(baseState);
  });
});
