import { GlobalState } from "../../../../store/reducers/types";
import { LandingScreenBannerState } from "../reducer";
import {
  landingScreenBannerToRenderSelector,
  localBannerVisibilitySelector
} from "../selectors";

const mockState = {
  features: {
    landingBanners: {
      ITW_DISCOVERY: true,
      SETTINGS_DISCOVERY: false
    }
  }
} as GlobalState;

describe("bannerRenderableSelectors", () => {
  it("should correctly filter between redux visibility and passed selectors, while not breaking if an undefined bannerID is passed by backendStatus, and returning the first valid ID", () => {
    const landingScreenBannerOrder = [
      "not_implemented_in_fe", // should never be returned, since it is not implemented in FE
      "test1",
      "test2",
      "test3",
      "test4",
      "test5"
    ];
    const localVisibility = {
      test1: false,
      test2: true,
      test3: false,
      banner_that_shouldnt_render: true, // does not appear in BE status, so it should not be rendered even though it is in the various maps
      test4: true, // this should be returned
      test5: true // should not be returned since it is the second available in the  list
    };
    const renderabilityDataById = {
      test1: true,
      test2: false,
      test3: false,
      banner_that_shouldnt_render: true,
      test4: true,
      test5: true
    };

    const resultFunc = landingScreenBannerToRenderSelector.resultFunc;
    const expected = resultFunc(
      landingScreenBannerOrder,
      localVisibility as unknown as LandingScreenBannerState,
      renderabilityDataById as unknown as LandingScreenBannerState
    );
    expect(expected).toEqual("test4");
  });
  it("should return undefined if no banner is renderable", () => {
    const landingScreenBannerOrder = [
      "test1",
      "test2",
      "not_implemented_in_fe"
    ];
    const localVisibility = {
      test1: true,
      test2: true
    } as unknown as LandingScreenBannerState;
    const renderabilityDataById = {
      test1: true,
      test2: false
    } as unknown as LandingScreenBannerState;
    const falseVisibilityMap = {
      test1: false,
      test2: false
    } as unknown as LandingScreenBannerState;

    const resultFunc = landingScreenBannerToRenderSelector.resultFunc;
    const noBackendStatus = resultFunc(
      ["not", "valid", "ids"],
      localVisibility,
      renderabilityDataById
    );
    expect(noBackendStatus).toEqual(undefined);
    const noLocalVisibility = resultFunc(
      landingScreenBannerOrder,
      falseVisibilityMap,
      renderabilityDataById
    );
    expect(noLocalVisibility).toEqual(undefined);
    const noRenderabilityData = resultFunc(
      landingScreenBannerOrder,
      localVisibility,
      falseVisibilityMap
    );
    expect(noRenderabilityData).toEqual(undefined);
  });
});
describe("localBannerVisiblitySelector", () => {
  it("should return the local visibility", () => {
    const result = localBannerVisibilitySelector(mockState);
    expect(result).toEqual(mockState.features.landingBanners);
  });
});
