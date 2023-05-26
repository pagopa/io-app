import * as O from "fp-ts/lib/Option";
import { Tuple2, ITuple2 } from "@pagopa/ts-commons/lib/tuples";
import { BackendStatus } from "../../../../../../definitions/content/BackendStatus";
import { baseRawBackendStatus } from "../../../../../store/reducers/__mock__/backendStatus";
import { GlobalState } from "../../../../../store/reducers/types";
import { getAppVersion } from "../../../../../utils/appVersion";
import { isNativeLoginEnabledSelector } from "..";

jest.mock("react-native-device-info", () => ({
  getReadableVersion: jest.fn().mockReturnValue("1.2.3.4"),
  getVersion: jest.fn().mockReturnValue("1.2.3.4")
}));

jest.mock("../../../../../config", () => ({
  nativeLoginEnabled: true
}));

const currentAppVersion = getAppVersion();

describe("NativeLogin remote flag test", () => {
  const status: BackendStatus = {
    ...baseRawBackendStatus
  };

  function checkNativeLoginFlagWithBrokenStatus(expectedValue: boolean) {
    const customStoreWithMissingMinAppVersionInNativeLoginConfig = {
      backendStatus: {
        status: O.some({
          ...status,
          config: {}
        })
      }
    } as unknown as GlobalState;
    const actualStatus =
      customStoreWithMissingMinAppVersionInNativeLoginConfig.backendStatus
        .status;
    expect(O.isSome(actualStatus)).toBe(true);
    if (O.isSome(actualStatus)) {
      expect(actualStatus.value.config.nativeLogin).toBeUndefined();
    }
    const isNativeLoginEnabled = isNativeLoginEnabledSelector(
      customStoreWithMissingMinAppVersionInNativeLoginConfig
    );
    expect(isNativeLoginEnabled).toBe(expectedValue);
  }

  function checkBrokenNativeLoginFlagTest(
    minAppVersion: string | undefined,
    currentAppVersion: string,
    expectedValue: boolean
  ) {
    const testTitle = `NativeLogin${
      expectedValue ? "" : " NOT"
    } enabled with min version ${minAppVersion} for actual version ${currentAppVersion}`;
    it(testTitle, () => {
      checkNativeLoginFlagWithBrokenStatus(expectedValue);
    });
  }

  describe("NativeLogin flag test for empty values", () => {
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
      checkBrokenNativeLoginFlagTest(t.e1, currentAppVersion, t.e2)
    );
  });

  function checkIfNativeLoginFlagIsEnableForThisAppVersion(
    minAppVersion: string | undefined,
    expectedValue: boolean
  ) {
    const customStore = {
      backendStatus: {
        status: O.some({
          ...status,
          config: {
            ...status.config,
            nativeLogin: {
              min_app_version: {
                android: minAppVersion,
                ios: minAppVersion
              }
            }
          }
        })
      }
    } as unknown as GlobalState;

    const isNativeLoginEnabled = isNativeLoginEnabledSelector(customStore);
    expect(isNativeLoginEnabled).toBe(expectedValue);
  }

  function checkNativeLoginFlagTest(
    minAppVersion: string | undefined,
    currentAppVersion: string,
    expectedValue: boolean
  ) {
    const testTitle = `NativeLogin${
      expectedValue ? "" : " NOT"
    } enabled with min version ${minAppVersion} for actual version ${currentAppVersion}`;
    it(testTitle, () => {
      checkIfNativeLoginFlagIsEnableForThisAppVersion(
        minAppVersion,
        expectedValue
      );
    });
  }

  describe("NativeLogin flag test for different config values", () => {
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
      checkNativeLoginFlagTest(t.e1, currentAppVersion, t.e2)
    );
  });
});
