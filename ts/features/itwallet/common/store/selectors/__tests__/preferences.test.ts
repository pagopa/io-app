import { addDays, addMonths } from "date-fns";
import _ from "lodash";
import MockDate from "mockdate";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import {
  itwAuthLevelSelector,
  itwIsDiscoveryBannerHiddenSelector
} from "../preferences";
import { ItwAuthLevel } from "../../../utils/itwTypesUtils.ts";

describe("itwIsDiscoveryBannerHiddenSelector", () => {
  it.each([
    [false, undefined],
    [false, "definitely not a date"],
    [false, new Date().toISOString()],
    [false, addDays(new Date(), -2).toISOString()],
    [true, addMonths(new Date(), 2).toISOString()]
  ])("should return %p if banner is hidden until %p", (expected, value) => {
    const globalState = appReducer(undefined, applicationChangeState("active"));

    expect(
      itwIsDiscoveryBannerHiddenSelector(
        _.set(globalState, "features.itWallet.preferences", {
          hideDiscoveryBannerUntilDate: value
        })
      )
    ).toBe(expected);
  });
});

describe("itwAuthLevelSelector", () => {
  afterEach(() => {
    // Always reset the date after each test to avoid side effects
    MockDate.reset();
  });

  it("returns the auth level when it is set", () => {
    const state = appReducer(undefined, applicationChangeState("active"));
    const updatedState = {
      ...state,
      features: {
        ...state.features,
        itWallet: {
          ...state.features?.itWallet,
          preferences: {
            ...state.features?.itWallet?.preferences,
            authLevel: "L2" as ItwAuthLevel
          }
        }
      }
    };

    expect(itwAuthLevelSelector(updatedState)).toEqual("L2");
  });

  it("returns undefined when the auth level is not set", () => {
    const state = appReducer(undefined, applicationChangeState("active"));
    const updatedState = {
      ...state,
      features: {
        ...state.features,
        itWallet: {
          ...state.features?.itWallet,
          preferences: {
            ...state.features?.itWallet?.preferences,
            authLevel: undefined
          }
        }
      }
    };

    expect(itwAuthLevelSelector(updatedState)).toBeUndefined();
  });
});
