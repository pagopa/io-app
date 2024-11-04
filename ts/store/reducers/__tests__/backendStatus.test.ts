import * as O from "fp-ts/lib/Option";
import { BackendStatus } from "../../../../definitions/content/BackendStatus";
import { baseRawBackendStatus } from "../__mock__/backendStatus";
import {
  areSystemsDeadReducer,
  BackendStatusState,
  barcodesScannerConfigSelector,
  isPnAppVersionSupportedSelector,
  isPremiumMessagesOptInOutEnabledSelector,
  landingScreenBannerOrderSelector
} from "../backendStatus";
import { GlobalState } from "../types";
import * as appVersion from "../../../utils/appVersion";

describe("backend service status reducer", () => {
  // smoke tests: valid / invalid
  const responseON: BackendStatus = {
    ...baseRawBackendStatus,
    is_alive: true,
    message: {
      "it-IT": "messaggio in italiano",
      "en-EN": "english message"
    }
  };

  const responseOff: BackendStatus = {
    ...baseRawBackendStatus,
    is_alive: false,
    message: {
      "it-IT": "messaggio in italiano",
      "en-EN": "english message"
    }
  };

  const currentState: BackendStatusState = {
    status: O.none,
    areSystemsDead: false,
    deadsCounter: 0
  };

  it("should decode the backend status", () => {
    const newState = areSystemsDeadReducer(currentState, responseON);
    expect(newState.areSystemsDead).toBeFalsy();
    expect(newState.deadsCounter).toEqual(0);
    expect(O.isSome(newState.status)).toBeTruthy();
  });

  it("should return a new state with alive false", () => {
    // dead one
    const newState = areSystemsDeadReducer(currentState, responseOff);
    expect(newState.areSystemsDead).toBeFalsy();
    expect(newState.deadsCounter).toEqual(1);

    // dead two
    const newState2 = areSystemsDeadReducer(newState, responseOff);
    expect(newState2.areSystemsDead).toBeTruthy();
    expect(newState2.deadsCounter).toEqual(2);
  });

  it("should return a new state with dead counter reset when it processes positive-negative", () => {
    // dead one (positive)
    const newState = areSystemsDeadReducer(currentState, responseOff);
    expect(newState.areSystemsDead).toBeFalsy();
    expect(newState.deadsCounter).toEqual(1);

    // negative
    const newState2 = areSystemsDeadReducer(currentState, responseON);
    expect(newState2.areSystemsDead).toBeFalsy();
    expect(newState2.deadsCounter).toEqual(0);
  });
});

// TODO: refactor using  baseBackendState
describe("test selectors", () => {
  // smoke tests: valid / invalid
  const noneStore = {
    backendStatus: {
      status: O.none
    }
  } as any as GlobalState;

  describe("premium messages opt-in/out selectors", () => {
    it("should return false if the remote flag is undefined", () => {
      const output = isPremiumMessagesOptInOutEnabledSelector(noneStore);
      expect(output).toBeFalsy();
    });

    it("should return false if the remote flag is false", () => {
      const customStore = {
        backendStatus: {
          status: O.some({
            config: {
              premiumMessages: { opt_in_out_enabled: false }
            }
          })
        }
      } as unknown as GlobalState;

      const output = isPremiumMessagesOptInOutEnabledSelector(customStore);

      expect(output).toBeFalsy();
    });

    it("should return true if the remote flag is true", () => {
      const customStore = {
        backendStatus: {
          status: O.some({
            config: {
              premiumMessages: { opt_in_out_enabled: true }
            }
          })
        }
      } as unknown as GlobalState;

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
        backendStatus: {
          status: O.some({
            config: {
              barcodesScanner: { dataMatrixPosteEnabled: true }
            }
          })
        }
      } as unknown as GlobalState;

      const output = barcodesScannerConfigSelector(customStore);

      expect(output.dataMatrixPosteEnabled).toBe(true);
    });
  });
});

describe("isPnAppVersionSupportedSelector", () => {
  it("should return false, when 'backendStatus' is O.none", () => {
    const state = {
      backendStatus: {
        status: O.none
      }
    } as GlobalState;
    const isSupported = isPnAppVersionSupportedSelector(state);
    expect(isSupported).toBe(false);
  });
  it("should return false, when min_app_version is greater than `getAppVersion`", () => {
    const state = {
      backendStatus: {
        status: O.some({
          config: {
            pn: {
              min_app_version: {
                android: "2.0.0.0",
                ios: "2.0.0.0"
              }
            }
          }
        })
      }
    } as GlobalState;
    jest.spyOn(appVersion, "getAppVersion").mockImplementation(() => "1.0.0.0");
    const isSupported = isPnAppVersionSupportedSelector(state);
    expect(isSupported).toBe(false);
  });
  it("should return true, when min_app_version is equal to `getAppVersion`", () => {
    const state = {
      backendStatus: {
        status: O.some({
          config: {
            pn: {
              min_app_version: {
                android: "2.0.0.0",
                ios: "2.0.0.0"
              }
            }
          }
        })
      }
    } as GlobalState;
    jest.spyOn(appVersion, "getAppVersion").mockImplementation(() => "2.0.0.0");
    const isSupported = isPnAppVersionSupportedSelector(state);
    expect(isSupported).toBe(true);
  });
  it("should return true, when min_app_version is less than `getAppVersion`", () => {
    const state = {
      backendStatus: {
        status: O.some({
          config: {
            pn: {
              min_app_version: {
                android: "2.0.0.0",
                ios: "2.0.0.0"
              }
            }
          }
        })
      }
    } as GlobalState;
    jest.spyOn(appVersion, "getAppVersion").mockImplementation(() => "3.0.0.0");
    const isSupported = isPnAppVersionSupportedSelector(state);
    expect(isSupported).toBe(true);
  });
});

describe("landingScreenBannerOrderSelector", () => {
  const getMock = (priority_order: any) =>
    ({
      backendStatus: {
        status: O.some({
          config: {
            landing_banners: {
              priority_order
            }
          }
        })
      }
    } as GlobalState);

  const some_priorityOrder = ["id1", "id2", "id3"];
  const customNoneStore = {
    backendStatus: {
      status: O.none
    }
  } as GlobalState;
  const undefinedLandingBannersStore = {
    backendStatus: {
      status: O.some({
        config: {}
      })
    }
  } as GlobalState;
  const testCases = [
    {
      selectorInput: getMock(some_priorityOrder),
      expected: some_priorityOrder
    },
    {
      selectorInput: getMock(undefined),
      expected: []
    },
    {
      selectorInput: getMock([]),
      expected: []
    },
    {
      selectorInput: customNoneStore,
      expected: []
    },
    {
      selectorInput: undefinedLandingBannersStore,
      expected: []
    }
  ];

  for (const testCase of testCases) {
    it(`should return [${testCase.expected}] for ${JSON.stringify(
      testCase.selectorInput.backendStatus.status
    )}`, () => {
      const output = landingScreenBannerOrderSelector(testCase.selectorInput);
      expect(output).toStrictEqual(testCase.expected);
    });
  }
});
