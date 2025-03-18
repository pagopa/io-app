import { PersistPartial } from "redux-persist";
import { applicationChangeState } from "../../../../store/actions/application";
import { LandingScreenBannerId } from "../../utils/landingScreenBannerMap";
import { updateLandingScreenBannerVisibility } from "../actions";
import {
  LandingScreenBannerState,
  persistedLandingScreenBannersReducer
} from "../reducer";

type StateType = LandingScreenBannerState & PersistPartial;

describe("persistedLandingScreenBannersReducer", () => {
  it("should match snapshot", () => {
    expect(
      persistedLandingScreenBannersReducer(
        undefined,
        applicationChangeState("active")
      )
    ).toMatchSnapshot("undefined_no_action");
  });
  it("should update state on action received -- enabled:false", () => {
    const baseState = {
      session: {
        "banner-1": true
      }
    } as unknown as StateType;
    const action = updateLandingScreenBannerVisibility({
      enabled: false,
      id: "banner-1" as LandingScreenBannerId
    });

    const reducer = persistedLandingScreenBannersReducer(baseState, action);
    expect(reducer).toEqual({
      persisted: {},
      session: {
        "banner-1": false
      }
    });
  });
  it("should update state on action received -- enabled:true", () => {
    const baseState = {
      session: {
        "banner-1": false
      }
    } as unknown as StateType;
    const action = updateLandingScreenBannerVisibility({
      enabled: true,
      id: "banner-1" as LandingScreenBannerId
    });

    const reducer = persistedLandingScreenBannersReducer(baseState, action);
    expect(reducer).toEqual({
      persisted: {},
      session: {
        "banner-1": true
      }
    });
  });
  it("should not update state on invalid action received -- invalid id", () => {
    const baseState = {
      persisted: {},
      session: {
        "banner-1": false
      }
    } as unknown as StateType;
    const action = updateLandingScreenBannerVisibility({
      enabled: true,
      id: "banner-5" as LandingScreenBannerId
    });

    const reducer = persistedLandingScreenBannersReducer(baseState, action);
    expect(reducer).toEqual(baseState);
  });
});
