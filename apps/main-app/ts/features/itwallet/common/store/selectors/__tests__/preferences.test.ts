import _ from "lodash";
import MockDate from "mockdate";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import {
  itwAuthLevelSelector,
  itwWalletActivationFeedbackBannerSelector,
  itwIdentificationModeSelector,
  itwIsPidReissuingSurveyHiddenSelector
} from "../preferences";
import { ItwAuthLevel } from "../../../utils/itwTypesUtils.ts";
import { ItwWalletActivationFeedbackBannerData } from "../../actions/preferences";

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

const buildStateWithBannerData = (
  data: ItwWalletActivationFeedbackBannerData | undefined
) => {
  const base = appReducer(undefined, applicationChangeState("active"));
  return _.set(
    base,
    "features.itWallet.preferences.walletActivationFeedbackBannerData",
    data
  );
};

describe("itwWalletActivationFeedbackBannerSelector", () => {
  afterEach(() => {
    MockDate.reset();
  });

  it("returns undefined when no data is stored", () => {
    const state = buildStateWithBannerData(undefined);
    expect(itwWalletActivationFeedbackBannerSelector(state)).toBeUndefined();
  });

  it("returns the data when stored within 7 days", () => {
    MockDate.set("2026-07-01T12:00:00.000Z");
    const data: ItwWalletActivationFeedbackBannerData = {
      date: "2026-06-28T12:00:00.000Z", // 3 days ago
      docStatus: "not_active",
      authMethod: "spid"
    };
    const state = buildStateWithBannerData(data);
    expect(itwWalletActivationFeedbackBannerSelector(state)).toEqual(data);
  });

  it("returns the data on the boundary (exactly 7 days ago)", () => {
    MockDate.set("2026-07-01T12:00:00.000Z");
    const data: ItwWalletActivationFeedbackBannerData = {
      date: "2026-06-24T12:00:00.000Z", // exactly 7 days ago
      docStatus: "active",
      authMethod: "cieidL2"
    };
    const state = buildStateWithBannerData(data);
    expect(itwWalletActivationFeedbackBannerSelector(state)).toEqual(data);
  });

  it("returns undefined when the data is more than 7 days old", () => {
    MockDate.set("2026-07-01T12:00:00.000Z");
    const data: ItwWalletActivationFeedbackBannerData = {
      date: "2026-06-23T11:59:59.000Z", // just over 7 days ago
      docStatus: "not_active",
      authMethod: "ciepin"
    };
    const state = buildStateWithBannerData(data);
    expect(itwWalletActivationFeedbackBannerSelector(state)).toBeUndefined();
  });

  it("returns data for all authMethod values within 7 days", () => {
    MockDate.set("2026-07-01T00:00:00.000Z");
    const authMethods = ["spid", "ciepin", "cieidL2", "cieidL3"] as const;
    authMethods.forEach(authMethod => {
      const data: ItwWalletActivationFeedbackBannerData = {
        date: "2026-07-01T00:00:00.000Z",
        docStatus: "not_active",
        authMethod
      };
      const state = buildStateWithBannerData(data);
      expect(itwWalletActivationFeedbackBannerSelector(state)).toEqual(data);
    });
  });
});
