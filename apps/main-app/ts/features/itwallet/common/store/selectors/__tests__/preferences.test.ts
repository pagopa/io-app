import _ from "lodash";
import MockDate from "mockdate";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import {
  itwAuthLevelSelector,
  itwNotEmptyWalletSuccessBannerDataSelector,
  itwIdentificationModeSelector,
  itwIsPidReissuingSurveyHiddenSelector,
  itwShouldShowNotEmptyWalletSuccessBannerSelector
} from "../preferences";
import { ItwAuthLevel } from "../../../utils/itwTypesUtils.ts";
import { ItwNotEmptyWalletSuccessBannerData } from "../../actions/preferences";

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

const buildStateWithCredentialSuccessData = (
  data: ItwNotEmptyWalletSuccessBannerData | undefined
) => {
  const base = appReducer(undefined, applicationChangeState("active"));
  return _.set(
    base,
    "features.itWallet.preferences.notEmptyWalletSuccessBannerData",
    data
  );
};

describe("itwNotEmptyWalletSuccessBannerDataSelector", () => {
  it("returns undefined when no data is stored", () => {
    const state = buildStateWithCredentialSuccessData(undefined);
    expect(itwNotEmptyWalletSuccessBannerDataSelector(state)).toBeUndefined();
  });

  it("returns the stored credential success data", () => {
    const data: ItwNotEmptyWalletSuccessBannerData = {
      date: "2026-06-30T10:00:00.000Z",
      docStatus: "not_active",
      authMethod: "ciepin"
    };
    const state = buildStateWithCredentialSuccessData(data);
    expect(itwNotEmptyWalletSuccessBannerDataSelector(state)).toEqual(data);
  });
});

describe("itwShouldShowNotEmptyWalletSuccessBannerSelector", () => {
  afterEach(() => {
    MockDate.reset();
  });

  it("returns false when no credential success data is stored", () => {
    const state = buildStateWithCredentialSuccessData(undefined);
    expect(itwShouldShowNotEmptyWalletSuccessBannerSelector(state)).toBe(false);
  });

  it("returns true when the credential was added less than 7 days ago", () => {
    MockDate.set("2026-07-01T12:00:00.000Z");
    const data: ItwNotEmptyWalletSuccessBannerData = {
      date: "2026-06-28T12:00:00.000Z", // 3 days ago
      docStatus: "not_active",
      authMethod: "spid"
    };
    const state = buildStateWithCredentialSuccessData(data);
    expect(itwShouldShowNotEmptyWalletSuccessBannerSelector(state)).toBe(true);
  });

  it("returns true on the boundary (exactly 7 days ago)", () => {
    MockDate.set("2026-07-01T12:00:00.000Z");
    const data: ItwNotEmptyWalletSuccessBannerData = {
      date: "2026-06-24T12:00:00.000Z", // exactly 7 days ago
      docStatus: "active",
      authMethod: "cieidL2"
    };
    const state = buildStateWithCredentialSuccessData(data);
    expect(itwShouldShowNotEmptyWalletSuccessBannerSelector(state)).toBe(true);
  });

  it("returns false when the credential was added more than 7 days ago", () => {
    MockDate.set("2026-07-01T12:00:00.000Z");
    const data: ItwNotEmptyWalletSuccessBannerData = {
      date: "2026-06-23T11:59:59.000Z", // just over 7 days ago
      docStatus: "not_active",
      authMethod: "ciepin"
    };
    const state = buildStateWithCredentialSuccessData(data);
    expect(itwShouldShowNotEmptyWalletSuccessBannerSelector(state)).toBe(false);
  });

  it("returns true for all authMethod values within 7 days", () => {
    MockDate.set("2026-07-01T00:00:00.000Z");
    const authMethods = ["spid", "ciepin", "cieidL2", "cieidL3"] as const;
    authMethods.forEach(authMethod => {
      const state = buildStateWithCredentialSuccessData({
        date: "2026-07-01T00:00:00.000Z",
        docStatus: "not_active",
        authMethod
      });
      expect(itwShouldShowNotEmptyWalletSuccessBannerSelector(state)).toBe(
        true
      );
    });
  });
});
