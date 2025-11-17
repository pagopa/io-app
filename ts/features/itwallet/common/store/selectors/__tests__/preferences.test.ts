import { addDays, addMonths } from "date-fns";
import _ from "lodash";
import MockDate from "mockdate";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import {
  itwAuthLevelSelector,
  itwIsDiscoveryBannerHiddenSelector,
  itwIsFeedbackBannerHiddenSelector,
  itwRequestedCredentialsSelector,
  itwIsPidReissuingSurveyHidden
} from "../preferences";
import { ItwAuthLevel } from "../../../utils/itwTypesUtils.ts";

describe("itwIsFeedbackBannerHiddenSelector", () => {
  it.each([
    [false, undefined],
    [false, "definitely not a date"],
    [false, new Date().toISOString()],
    [false, addDays(new Date(), -2).toISOString()],
    [true, addMonths(new Date(), 1).toISOString()],
    [true, addMonths(new Date(), 2).toISOString()]
  ])("should return %p if banner is hidden until %p", (expected, value) => {
    const globalState = appReducer(undefined, applicationChangeState("active"));

    expect(
      itwIsFeedbackBannerHiddenSelector(
        _.set(globalState, "features.itWallet.preferences", {
          hideFeedbackBannerUntilDate: value
        })
      )
    ).toBe(expected);
  });
});

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

describe("itwRequestedCredentialsSelector", () => {
  it("should return the list of requested credentials in the past 24 hours", () => {
    MockDate.set("2023-11-15T20:43:21.361Z");

    const globalState = appReducer(undefined, applicationChangeState("active"));

    expect(
      itwRequestedCredentialsSelector(
        _.set(globalState, "features.itWallet.preferences", {
          requestedCredentials: {
            MDL: "2023-11-14T20:43:21.362Z",
            EuropeanDisabilityCard: "2023-11-14T20:43:21.360Z",
            EuropeanHealthInsuranceCard: "2023-11-14T20:43:21.361Z"
          }
        })
      )
    ).toEqual(["MDL"]);
    MockDate.reset();
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

describe("itwIsPidReissuingSurveyHidden", () => {
  afterEach(() => {
    // Always reset the date after each test to avoid side effects
    MockDate.reset();
  });

  it("should set the hidden state of the bottom sheet", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));

    const updatedState = _.set(globalState, "features.itWallet.preferences", {
      isPidReissuingSurveyHidden: true
    });

    expect(itwIsPidReissuingSurveyHidden(updatedState)).toBe(true);
  });
});
