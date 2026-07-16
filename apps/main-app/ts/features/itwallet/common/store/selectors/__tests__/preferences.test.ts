import _ from "lodash";
import MockDate from "mockdate";

import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { ItwAuthLevel } from "../../../utils/itwTypesUtils.ts";
import { ItwWalletActivationFeedbackBannerData } from "../../actions/preferences";
import {
  itwAuthLevelSelector,
  itwIdentificationModeSelector,
  itwIsPidReissuingSurveyHiddenSelector,
  itwWalletActivationFeedbackBannerDataSelector
} from "../preferences";

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

describe("itwIdentificationModeSelector", () => {
  afterEach(() => {
    MockDate.reset();
  });

  it("returns the identification mode when it is set", () => {
    const state = appReducer(undefined, applicationChangeState("active"));
    const updatedState = {
      ...state,
      features: {
        ...state.features,
        itWallet: {
          ...state.features?.itWallet,
          preferences: {
            ...state.features?.itWallet?.preferences,
            identificationMode: "cieId" as const
          }
        }
      }
    };

    expect(itwIdentificationModeSelector(updatedState)).toEqual("cieId");
  });

  it("returns undefined when the identification mode is not set", () => {
    const state = appReducer(undefined, applicationChangeState("active"));
    const updatedState = {
      ...state,
      features: {
        ...state.features,
        itWallet: {
          ...state.features?.itWallet,
          preferences: {
            ...state.features?.itWallet?.preferences,
            identificationMode: undefined
          }
        }
      }
    };

    expect(itwIdentificationModeSelector(updatedState)).toBeUndefined();
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

describe("itwWalletActivationFeedbackBannerDataSelector", () => {
  it("returns undefined when no data is stored", () => {
    const state = appReducer(undefined, applicationChangeState("active"));
    expect(
      itwWalletActivationFeedbackBannerDataSelector(state)
    ).toBeUndefined();
  });

  it("returns the stored data regardless of visibility", () => {
    const data: ItwWalletActivationFeedbackBannerData = {
      docStatus: "not_active",
      authMethod: "spid"
    };
    const base = appReducer(undefined, applicationChangeState("active"));
    const state = {
      ...base,
      features: {
        ...base.features,
        itWallet: {
          ...base.features?.itWallet,
          preferences: {
            ...base.features?.itWallet?.preferences,
            walletActivationFeedbackBannerData: data
          }
        }
      }
    };
    expect(itwWalletActivationFeedbackBannerDataSelector(state)).toEqual(data);
  });
});
