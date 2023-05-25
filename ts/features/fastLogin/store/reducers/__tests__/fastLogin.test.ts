import * as O from "fp-ts/lib/Option";
import { Tuple2, ITuple2 } from "@pagopa/ts-commons/lib/tuples";
import { BackendStatus } from "../../../../../../definitions/content/BackendStatus";
import { baseRawBackendStatus } from "../../../../../store/reducers/__mock__/backendStatus";
import { isFastLoginEnabledSelector } from "../../../../../store/reducers/backendStatus";
import { GlobalState } from "../../../../../store/reducers/types";
import { getAppVersion } from "../../../../../utils/appVersion";

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
      backendStatus: {
        status: O.some({
          ...status,
          config: {}
        })
      }
    } as unknown as GlobalState;
    const actualStatus =
      customStoreWithMissingMinAppVersionInFastLoginConfig.backendStatus.status;
    expect(O.isSome(actualStatus)).toBe(true);
    if (O.isSome(actualStatus)) {
      expect(actualStatus.value.config.fastLogin).toBeUndefined();
    }
    const isFastLoginEnabled = isFastLoginEnabledSelector(
      customStoreWithMissingMinAppVersionInFastLoginConfig
    );
    expect(isFastLoginEnabled).toBe(expectedValue);
  }

  function checkBrokenFastLoginFlagTest(
    minAppVersion: string | undefined,
    currentAppVersion: string,
    expectedValue: boolean
  ) {
    const testTitle = `FastLogin${
      expectedValue ? "" : " NOT"
    } enabled with min version ${minAppVersion} for actual version ${currentAppVersion}`;
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
      backendStatus: {
        status: O.some({
          ...status,
          config: {
            ...status.config,
            fastLogin: {
              min_app_version: {
                android: minAppVersion,
                ios: minAppVersion
              }
            }
          }
        })
      }
    } as unknown as GlobalState;

    const isFastLoginEnabled = isFastLoginEnabledSelector(customStore);
    expect(isFastLoginEnabled).toBe(expectedValue);
  }

  function checkFastLoginFlagTest(
    minAppVersion: string | undefined,
    currentAppVersion: string,
    expectedValue: boolean
  ) {
    const testTitle = `FastLogin${
      expectedValue ? "" : " NOT"
    } enabled with min version ${minAppVersion} for actual version ${currentAppVersion}`;
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
