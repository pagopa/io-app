import _ from "lodash";
import MockDate from "mockdate";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import {
  itwAuthLevelSelector,
  itwIsPidReissuingSurveyHiddenSelector
} from "../preferences";
import { ItwAuthLevel } from "../../../utils/itwTypesUtils.ts";

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

describe("itwIsPidReissuingSurveyHiddenSelector", () => {
  afterEach(() => {
    // Always reset the date after each test to avoid side effects
    MockDate.reset();
  });

  it("should set the hidden state of the bottom sheet", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));

    const updatedState = _.set(globalState, "features.itWallet.preferences", {
      isPidReissuingSurveyHidden: true
    });

    expect(itwIsPidReissuingSurveyHiddenSelector(updatedState)).toBe(true);
  });
});
