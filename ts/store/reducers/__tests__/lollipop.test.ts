import * as O from "fp-ts/lib/Option";
import { Tuple2, ITuple2 } from "@pagopa/ts-commons/lib/tuples";
import { BackendStatus } from "../../../../definitions/content/BackendStatus";
import { baseRawBackendStatus } from "../__mock__/backendStatus";
import { isLollipopEnabledSelector } from "../backendStatus";
import { GlobalState } from "../types";
import { getAppVersion } from "../../../utils/appVersion";

jest.mock("react-native-device-info", () => ({
  getReadableVersion: jest.fn().mockReturnValue("1.2.3.4"),
  getVersion: jest.fn().mockReturnValue("1.2.3.4")
}));

describe("LolliPOP remote flag test", () => {
  const status: BackendStatus = {
    ...baseRawBackendStatus
  };

  function checkIfLollipopFlagIsEnableForThisAppVersion(
    minAppVersion: string | undefined,
    expectedValue: boolean
  ) {
    const customStore = {
      backendStatus: {
        status: O.some({
          ...status,
          config: {
            ...status.config,
            lollipop: {
              enabled: false,
              min_app_version: {
                android: minAppVersion,
                ios: minAppVersion
              }
            }
          }
        })
      }
    } as unknown as GlobalState;

    const isLollipopEnabled = isLollipopEnabledSelector(customStore);
    expect(isLollipopEnabled).toBe(expectedValue);
  }

  function checkLollipopFlagTest(
    minAppVersion: string | undefined,
    currentAppVersion: string,
    expectedValue: boolean
  ) {
    const testTitle = `LolliPOP${
      expectedValue ? "" : " NOT"
    } enabled with min version ${minAppVersion} for actual version ${currentAppVersion}`;
    it(testTitle, () => {
      checkIfLollipopFlagIsEnableForThisAppVersion(
        minAppVersion,
        expectedValue
      );
    });
  }

  const currentAppVersion = getAppVersion();

  [
    Tuple2("0.0.0.0", true),
    Tuple2("1.2.3.0", true),
    Tuple2("-1", true),
    Tuple2("1.2.3.5", false),
    Tuple2("", true),
    Tuple2(undefined, true),
    Tuple2("?$&&/!@", true)
  ].forEach((t: ITuple2<string | undefined, boolean>) =>
    checkLollipopFlagTest(t.e1, currentAppVersion, t.e2)
  );
});
