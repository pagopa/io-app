import * as O from "fp-ts/lib/Option";
import { Tuple2, ITuple2 } from "@pagopa/ts-commons/lib/tuples";
import { BackendStatus } from "../../../../../../definitions/content/BackendStatus";
import { baseRawBackendStatus } from "../../../../../store/reducers/__mock__/backendStatus";
import { isLollipopEnabledSelector } from "../../../../../store/reducers/backendStatus";
import { GlobalState } from "../../../../../store/reducers/types";
import { getAppVersion } from "../../../../../utils/appVersion";
import { appReducer } from "../../../../../store/reducers";
import { applicationChangeState } from "../../../../../store/actions/application";
import { lollipopKeyTagSave } from "../../actions/lollipop";
import lollipopReducer, { lollipopSelector } from "./../lollipop";

jest.mock("react-native-device-info", () => ({
  getReadableVersion: jest.fn().mockReturnValue("1.2.3.4"),
  getVersion: jest.fn().mockReturnValue("1.2.3.4")
}));

const globalState = appReducer(undefined, applicationChangeState("active"));

describe("Lollipop state", () => {
  it("Test selectors and reducers", () => {
    const lollipopState = lollipopSelector(globalState);
    expect(lollipopState.keyTag).toBe(undefined);
    const newLollipopState = lollipopReducer(
      lollipopState,
      lollipopKeyTagSave({ keyTag: "newKeyTag" })
    );
    expect(newLollipopState.keyTag).toBe("newKeyTag");
  });
});

describe("LolliPOP remote flag test", () => {
  const status: BackendStatus = {
    ...baseRawBackendStatus
  };

  function checkLollipopFlagWithBrokenStatus(expectedValue: boolean) {
    const customStoreWithMissingMinAppVersionInLollipopConfig = {
      backendStatus: {
        status: O.some({
          ...status,
          config: {}
        })
      }
    } as unknown as GlobalState;
    const isLollipopEnabled = isLollipopEnabledSelector(
      customStoreWithMissingMinAppVersionInLollipopConfig
    );
    expect(isLollipopEnabled).toBe(expectedValue);
  }

  function checkBrokenLollipopFlagTest(
    minAppVersion: string | undefined,
    currentAppVersion: string,
    expectedValue: boolean
  ) {
    const testTitle = `LolliPOP${
      expectedValue ? "" : " NOT"
    } enabled with min version ${minAppVersion} for actual version ${currentAppVersion}`;
    it(testTitle, () => {
      checkLollipopFlagWithBrokenStatus(expectedValue);
    });
  }

  [
    Tuple2("0.0.0.0", false),
    Tuple2("1.2.3.0", false),
    Tuple2("-1", false),
    Tuple2("1.2.3.5", false),
    Tuple2("", false),
    Tuple2(undefined, false),
    Tuple2("?$&&/!@", false)
  ].forEach((t: ITuple2<string | undefined, boolean>) =>
    checkBrokenLollipopFlagTest(t.e1, currentAppVersion, t.e2)
  );

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
