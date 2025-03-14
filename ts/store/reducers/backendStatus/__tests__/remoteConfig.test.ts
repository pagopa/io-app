import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { identity } from "lodash";
import { GlobalState } from "../../types";
import {
  absolutePortalLinksSelector,
  barcodesScannerConfigSelector,
  fimsServiceConfiguration,
  generateDynamicUrlSelector,
  isIOMarkdownEnabledForMessagesAndServicesSelector,
  isPnAppVersionSupportedSelector,
  isPremiumMessagesOptInOutEnabledSelector,
  landingScreenBannerOrderSelector,
  pnMessagingServiceIdSelector
} from "../remoteConfig";
import * as appVersion from "../../../../utils/appVersion";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";

describe("remoteConfig", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

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

  describe("absolutePortalLinksSelector", () => {
    it("should return fallback links if remote config is undefined", () => {
      const output = absolutePortalLinksSelector(noneStore);
      expect(output).toStrictEqual({
        io_web: "https://ioapp.it/",
        io_showcase: "https://io.italia.it/"
      });
    });

    it("should return configured links if present in remote config", () => {
      const customStore = {
        remoteConfig: O.some({
          absolutePortalLinks: {
            io_web: "https://custom.ioapp.it/",
            io_showcase: "https://custom.italia.io/"
          }
        })
      } as GlobalState;

      const output = absolutePortalLinksSelector(customStore);
      expect(output).toStrictEqual({
        io_web: "https://custom.ioapp.it/",
        io_showcase: "https://custom.italia.io/"
      });
    });
  });

  describe("generateDynamicUrlSelector", () => {
    const mockState = {
      remoteConfig: O.some({
        absolutePortalLinks: {
          io_web: "https://custom.ioapp.it/",
          io_showcase: "https://custom.italia.io/"
        }
      })
    } as GlobalState;

    it("should generate a complete URL with valid base key and path", () => {
      const output = generateDynamicUrlSelector(
        mockState,
        "io_web",
        "path/to/resource"
      );
      expect(output).toBe("https://custom.ioapp.it/path/to/resource");
    });

    it("should handle missing trailing slash in base URL", () => {
      const customState = {
        remoteConfig: O.some({
          absolutePortalLinks: {
            io_web: "https://custom.ioapp.it"
          }
        })
      } as GlobalState;

      const output = generateDynamicUrlSelector(
        customState,
        "io_web",
        "another/path"
      );
      expect(output).toBe("https://custom.ioapp.it/another/path");
    });

    it("should return the base key as fallback if an error occurs", () => {
      const output = generateDynamicUrlSelector(noneStore, "io_web", "path");
      expect(output).toBe("https://ioapp.it/path");
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
      jest
        .spyOn(appVersion, "getAppVersion")
        .mockImplementation(() => "1.0.0.0");
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
      jest
        .spyOn(appVersion, "getAppVersion")
        .mockImplementation(() => "2.0.0.0");
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
      jest
        .spyOn(appVersion, "getAppVersion")
        .mockImplementation(() => "3.0.0.0");
      const isSupported = isPnAppVersionSupportedSelector(state);
      expect(isSupported).toBe(true);
    });
  });
  describe("landingScreenBannerOrderSelector", () => {
    const getMock = (priority_order: Array<string> | undefined) =>
      ({
        remoteConfig: O.some({
          landing_banners: {
            priority_order
          }
        })
      } as GlobalState);

    const some_priorityOrder = ["id1", "id2", "id3"];
    const customNoneStore = {
      remoteConfig: O.none
    } as GlobalState;
    const undefinedLandingBannersStore = {
      remoteConfig: O.some({})
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
        pipe(
          testCase.selectorInput.remoteConfig,
          O.fold(
            // eslint-disable-next-line no-underscore-dangle
            () => testCase.selectorInput.remoteConfig._tag,
            identity
          )
        )
      )}`, () => {
        const output = landingScreenBannerOrderSelector(testCase.selectorInput);
        expect(output).toStrictEqual(testCase.expected);
      });
    }
  });

  describe("fimsServiceConfiguration", () => {
    it("should retrieve configuration for matching id", () => {
      const configurationId = "aConfId";
      const organizationFiscalCode = "12345678901";
      const organizationName = "Organization name";
      const serviceId = "01JMHVSD7JGCNJF36TX0JM0JF3" as ServiceId;
      const serviceName = "Service name";
      const state = {
        remoteConfig: O.some({
          fims: {
            services: [
              {
                configuration_id: configurationId,
                service_id: serviceId,
                organization_fiscal_code: organizationFiscalCode,
                organization_name: "Organization name",
                service_name: "Service name"
              }
            ]
          }
        })
      } as GlobalState;
      const serviceConfiguration = fimsServiceConfiguration(
        state,
        configurationId
      );
      expect(serviceConfiguration).toEqual({
        configuration_id: configurationId,
        service_id: serviceId,
        organization_fiscal_code: organizationFiscalCode,
        organization_name: organizationName,
        service_name: serviceName
      });
    });
    it("should return 'undefined' for unmatching id", () => {
      const state = {
        remoteConfig: O.some({
          fims: {
            services: [
              {
                configuration_id: "aConfId",
                service_id: "01JMHVSD7JGCNJF36TX0JM0JF3",
                organization_fiscal_code: "12345678901",
                organization_name: "Organization name",
                service_name: "Service name"
              }
            ]
          }
        })
      } as GlobalState;
      const serviceConfiguration = fimsServiceConfiguration(
        state,
        "unmatchingConfId"
      );
      expect(serviceConfiguration).toBeUndefined();
    });
  });
});
describe("isIOMarkdownEnabledForMessagesAndServicesSelector", () => {
  (
    [
      [
        {
          remoteConfig: O.none
        } as GlobalState,
        false
      ],
      [
        {
          remoteConfig: O.some({})
        },
        true
      ],
      [
        {
          remoteConfig: O.some({
            ioMarkdown: {}
          })
        },
        true
      ],
      [
        {
          remoteConfig: O.some({
            ioMarkdown: {
              min_app_version: {}
            }
          })
        },
        false
      ],
      [
        {
          remoteConfig: O.some({
            ioMarkdown: {
              min_app_version: {
                android: "0.0.0.0",
                ios: "0.0.0.0"
              }
            }
          })
        },
        false
      ],
      [
        {
          remoteConfig: O.some({
            ioMarkdown: {
              min_app_version: {
                android: "1.0.0.0",
                ios: "1.0.0.0"
              }
            }
          })
        },
        true
      ],
      [
        {
          remoteConfig: O.some({
            ioMarkdown: {
              min_app_version: {
                android: "2.0.0.0",
                ios: "2.0.0.0"
              }
            }
          })
        },
        true
      ],
      [
        {
          remoteConfig: O.some({
            ioMarkdown: {
              min_app_version: {
                android: "2.0.0.1",
                ios: "2.0.0.1"
              }
            }
          })
        },
        false
      ]
    ] as ReadonlyArray<[GlobalState, boolean]>
  ).forEach(testData =>
    it(`should return '${testData[1]}' for '${JSON.stringify(
      testData[0]
    )}'`, () => {
      jest
        .spyOn(appVersion, "getAppVersion")
        .mockImplementation(() => "2.0.0.0");
      const output = isIOMarkdownEnabledForMessagesAndServicesSelector(
        testData[0]
      );
      expect(output).toBe(testData[1]);
    })
  );
});

describe("pnMessageServiceIdSelector", () => {
  const someState = {
    remoteConfig: O.some({
      pn: {
        notificationServiceId: "NOTIF_SID"
      }
    })
  } as GlobalState;
  const emptyObjectState = {
    remoteConfig: O.some({
      pn: {}
    })
  } as GlobalState;
  const noneState = {
    remoteConfig: O.none
  } as GlobalState;
  const emptyStringState = {
    remoteConfig: O.some({
      pn: { notificationServiceId: "" }
    })
  } as GlobalState;
  const undefinedState = {
    remoteConfig: O.some({
      pn: { notificationServiceId: undefined }
    })
  } as GlobalState;

  const testCases = [
    {
      result: "NOTIF_SID",
      input: someState
    },
    {
      result: undefined,
      input: emptyObjectState
    },
    {
      result: "",
      input: emptyStringState
    },
    {
      result: undefined,
      input: noneState
    },
    {
      result: undefined,
      input: undefinedState
    }
  ];
  for (const { result, input } of testCases) {
    it(`should return the correct result for input : ${JSON.stringify(
      input
    )}`, () => {
      const output = pnMessagingServiceIdSelector(input);
      expect(output).toBe(result);
    });
  }
});
