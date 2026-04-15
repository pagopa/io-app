import * as O from "fp-ts/lib/Option";
import { Tuple2, ITuple2 } from "@pagopa/ts-commons/lib/tuples";
import { DeepPartial } from "redux";
import { BackendStatus } from "../../../../../../definitions/content/BackendStatus";
import { baseRawBackendStatus } from "../../../../../store/reducers/__mock__/backendStatus";
import { GlobalState } from "../../../../../store/reducers/types";
import { getAppVersion } from "../../../../../utils/appVersion";
import {
  fastLoginOptInSelector,
  fastLoginPendingActionsSelector,
  hasTwoMinutesElapsedSinceLastActivitySelector,
  isFastLoginEnabledSelector,
  isFastLoginUserInteractionNeededForSessionExpiredSelector,
  isSecurityAdviceAcknowledgedEnabled,
  isSecurityAdviceReadyToShow,
  tokenRefreshSelector
} from "../selectors";
import { Config } from "../../../../../../definitions/content/Config";

jest.mock("react-native-device-info", () => ({
  getReadableVersion: jest.fn().mockReturnValue("1.2.3.4"),
  getVersion: jest.fn().mockReturnValue("1.2.3.4")
}));

jest.mock("../../../../../config", () => ({
  fastLoginEnabled: true
}));

const currentAppVersion = getAppVersion();

describe("FastLogin remote flag test", () => {
  const status: BackendStatus = {
    ...baseRawBackendStatus
  };

  function checkFastLoginFlagWithBrokenStatus(expectedValue: boolean) {
    const customStoreWithMissingMinAppVersionInFastLoginConfig = {
      features: {
        loginFeatures: {
          fastLogin: {
            optIn: {
              enabled: true
            }
          }
        }
      },
      remoteConfig: O.some({})
    } as unknown as GlobalState;
    const actualStatus =
      customStoreWithMissingMinAppVersionInFastLoginConfig.remoteConfig;
    expect(O.isSome(actualStatus)).toBe(true);
    if (O.isSome(actualStatus)) {
      expect(actualStatus.value.fastLogin).toBeUndefined();
    }
    const isFastLoginEnabled = isFastLoginEnabledSelector(
      customStoreWithMissingMinAppVersionInFastLoginConfig
    );
    expect(isFastLoginEnabled).toBe(expectedValue);
  }

  function checkBrokenFastLoginFlagTest(
    minAppVersion: string | undefined,
    appVersion: string,
    expectedValue: boolean
  ) {
    const testTitle = `FastLogin${
      expectedValue ? "" : " NOT"
    } enabled with min version ${minAppVersion} for actual version ${appVersion}`;
    it(testTitle, () => {
      checkFastLoginFlagWithBrokenStatus(expectedValue);
    });
  }

  describe("FastLogin flag test for empty values", () => {
    [
      Tuple2("0", false),
      Tuple2("0.0", false),
      Tuple2("0.0.0", false),
      Tuple2("0.0.0.0", false),
      Tuple2("1", false),
      Tuple2("1.2", false),
      Tuple2("1.2.3", false),
      Tuple2("1.2.3.0", false),
      Tuple2("1.2.3.1", false),
      Tuple2("1.2.3.2", false),
      Tuple2("1.2.3.3", false),
      Tuple2("1.2.3.4", false),
      Tuple2("-1", false),
      Tuple2("1.2.3.5", false),
      Tuple2("", false),
      Tuple2(undefined, false),
      Tuple2("?$&&/!@", false)
    ].forEach((t: ITuple2<string | undefined, boolean>) =>
      checkBrokenFastLoginFlagTest(t.e1, currentAppVersion, t.e2)
    );
  });

  function checkIfFastLoginFlagIsEnableForThisAppVersion(
    minAppVersion: string | undefined,
    expectedValue: boolean
  ) {
    const customStore = {
      features: {
        loginFeatures: {
          fastLogin: {
            optIn: {
              enabled: true
            }
          }
        }
      },
      remoteConfig: O.some({
        ...status.config,
        fastLogin: {
          min_app_version: {
            android: minAppVersion,
            ios: minAppVersion
          }
        }
      } as Config)
    } as unknown as GlobalState;

    const isFastLoginEnabled = isFastLoginEnabledSelector(customStore);
    expect(isFastLoginEnabled).toBe(expectedValue);
  }

  function checkFastLoginFlagTest(
    minAppVersion: string | undefined,
    appVersion: string,
    expectedValue: boolean
  ) {
    const testTitle = `FastLogin${
      expectedValue ? "" : " NOT"
    } enabled with min version ${minAppVersion} for actual version ${appVersion}`;
    it(testTitle, () => {
      checkIfFastLoginFlagIsEnableForThisAppVersion(
        minAppVersion,
        expectedValue
      );
    });
  }

  describe("FastLogin flag test for different config values", () => {
    [
      Tuple2("0", false),
      Tuple2("0.0", false),
      Tuple2("0.0.0", false),
      Tuple2("0.0.0.0", false),
      Tuple2("1", true),
      Tuple2("1.2", true),
      Tuple2("1.2.3", true),
      Tuple2("1.2.3.0", true),
      Tuple2("1.2.3.1", true),
      Tuple2("1.2.3.2", true),
      Tuple2("1.2.3.3", true),
      Tuple2("1.2.3.4", true),
      Tuple2("-1", false),
      Tuple2("1.2.3.5", false),
      Tuple2("", false),
      Tuple2(undefined, false),
      Tuple2("?$&&/!@", false)
    ].forEach((t: ITuple2<string | undefined, boolean>) =>
      checkFastLoginFlagTest(t.e1, currentAppVersion, t.e2)
    );
  });
});

describe("FastLogin selectors", () => {
  const baseState: DeepPartial<GlobalState> = {
    features: {
      loginFeatures: {
        fastLogin: {
          optIn: { enabled: true, _persist: { version: 0, rehydrated: true } },
          automaticSessionRefresh: {
            areAlreadyTwoMinAfterLastActivity: true,
            _persist: { version: 0, rehydrated: true }
          },
          securityAdviceAcknowledged: {
            acknowledged: true,
            readyToShow: false,
            _persist: { version: 0, rehydrated: true }
          },
          tokenRefreshHandler: {
            userInteractionForSessionExpiredNeeded: true,
            tokenRefresh: { kind: "in-progress" },
            pendingActions: [{ type: "SOME_ACTION" }, { type: "SOME_ACTION" }]
          }
        }
      }
    }
  };

  const fullState = baseState as GlobalState;

  it("should select fastLoginOptIn", () => {
    expect(fastLoginOptInSelector(fullState).enabled).toBe(true);
  });

  it("should select hasTwoMinutesElapsedSinceLastActivitySelector", () => {
    expect(hasTwoMinutesElapsedSinceLastActivitySelector(fullState)).toBe(true);
  });

  it("should select isSecurityAdviceAcknowledgedEnabled", () => {
    expect(isSecurityAdviceAcknowledgedEnabled(fullState)).toBe(true);
  });

  it("should select isSecurityAdviceReadyToShow", () => {
    expect(isSecurityAdviceReadyToShow(fullState)).toBe(false);
  });

  it("should select isFastLoginUserInteractionNeededForSessionExpiredSelector", () => {
    expect(
      isFastLoginUserInteractionNeededForSessionExpiredSelector(fullState)
    ).toBe(true);
  });

  it("should select tokenRefreshSelector", () => {
    expect(tokenRefreshSelector(fullState)).toEqual({ kind: "in-progress" });
  });

  it("should deduplicate pending actions", () => {
    expect(fastLoginPendingActionsSelector(fullState)).toEqual([
      { type: "SOME_ACTION" }
    ]);
  });
});
