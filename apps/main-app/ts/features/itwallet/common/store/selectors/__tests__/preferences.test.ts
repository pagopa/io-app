import _ from "lodash";
import MockDate from "mockdate";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import {
  itwAuthLevelSelector,
  itwIdentificationModeSelector,
  isItwProximityEnabledSelector,
  itwIsPidReissuingSurveyHiddenSelector
} from "../preferences";
import * as lifecycleSelectors from "../../../../lifecycle/store/selectors";
import * as remoteConfigSelectors from "../remoteConfig";
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

describe("isItwProximityEnabledSelector", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  it.each`
    isWalletValid | isProximityVersionSupported | expected
    ${true}       | ${true}                     | ${true}
    ${true}       | ${false}                    | ${false}
    ${false}      | ${true}                     | ${false}
    ${false}      | ${false}                    | ${false}
  `(
    "returns $expected when isWalletValid=$isWalletValid and isProximityVersionSupported=$isProximityVersionSupported",
    ({ isWalletValid, isProximityVersionSupported, expected }) => {
      jest
        .spyOn(lifecycleSelectors, "itwLifecycleIsITWalletValidSelector")
        .mockReturnValue(isWalletValid);
      jest
        .spyOn(
          remoteConfigSelectors,
          "isItwProximityMinAppVersionSupportedSelector"
        )
        .mockReturnValue(isProximityVersionSupported);

      expect(isItwProximityEnabledSelector({} as unknown as GlobalState)).toBe(
        expected
      );
    }
  );
});
