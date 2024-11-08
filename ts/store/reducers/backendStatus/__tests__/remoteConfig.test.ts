import * as O from "fp-ts/lib/Option";
import { GlobalState } from "../../types";
import {
  barcodesScannerConfigSelector,
  isPnAppVersionSupportedSelector,
  isPremiumMessagesOptInOutEnabledSelector
} from "../remoteConfig";
import * as appVersion from "../../../../utils/appVersion";

describe("test selectors", () => {
  // smoke tests: valid / invalid
  const noneStore = {
    remoteConfig: O.none
  } as GlobalState;

  describe("premium messages opt-in/out selectors", () => {
    it("should return false if the remote flag is undefined", () => {
      const output = isPremiumMessagesOptInOutEnabledSelector(noneStore);
      expect(output).toBeFalsy();
    });

    it("should return false if the remote flag is false", () => {
      const customStore = {
        remoteConfig: O.some({
          premiumMessages: { opt_in_out_enabled: false }
        })
      } as GlobalState;

      const output = isPremiumMessagesOptInOutEnabledSelector(customStore);

      expect(output).toBeFalsy();
    });

    it("should return true if the remote flag is true", () => {
      const customStore = {
        remoteConfig: O.some({
          premiumMessages: { opt_in_out_enabled: true }
        })
      } as GlobalState;

      const output = isPremiumMessagesOptInOutEnabledSelector(customStore);

      expect(output).toBeTruthy();
    });
  });

  describe("barcodes scanner remote config selectors", () => {
    it("should return an all-false object if the remote flag is undefined", () => {
      const output = barcodesScannerConfigSelector(noneStore);
      expect(output.dataMatrixPosteEnabled).toBe(false);
    });

    it("should return the correct configuration", () => {
      const customStore = {
        remoteConfig: O.some({
          barcodesScanner: { dataMatrixPosteEnabled: true }
        })
      } as GlobalState;

      const output = barcodesScannerConfigSelector(customStore);

      expect(output.dataMatrixPosteEnabled).toBe(true);
    });
  });
});

describe("isPnAppVersionSupportedSelector", () => {
  it("should return false, when 'backendStatus' is O.none", () => {
    const state = {
      remoteConfig: O.none
    } as GlobalState;
    const isSupported = isPnAppVersionSupportedSelector(state);
    expect(isSupported).toBe(false);
  });
  it("should return false, when min_app_version is greater than `getAppVersion`", () => {
    const state = {
      remoteConfig: O.some({
        pn: {
          min_app_version: {
            android: "2.0.0.0",
            ios: "2.0.0.0"
          }
        }
      })
    } as GlobalState;
    jest.spyOn(appVersion, "getAppVersion").mockImplementation(() => "1.0.0.0");
    const isSupported = isPnAppVersionSupportedSelector(state);
    expect(isSupported).toBe(false);
  });
  it("should return true, when min_app_version is equal to `getAppVersion`", () => {
    const state = {
      remoteConfig: O.some({
        pn: {
          min_app_version: {
            android: "2.0.0.0",
            ios: "2.0.0.0"
          }
        }
      })
    } as GlobalState;
    jest.spyOn(appVersion, "getAppVersion").mockImplementation(() => "2.0.0.0");
    const isSupported = isPnAppVersionSupportedSelector(state);
    expect(isSupported).toBe(true);
  });
  it("should return true, when min_app_version is less than `getAppVersion`", () => {
    const state = {
      remoteConfig: O.some({
        pn: {
          min_app_version: {
            android: "2.0.0.0",
            ios: "2.0.0.0"
          }
        }
      })
    } as GlobalState;
    jest.spyOn(appVersion, "getAppVersion").mockImplementation(() => "3.0.0.0");
    const isSupported = isPnAppVersionSupportedSelector(state);
    expect(isSupported).toBe(true);
  });
});
