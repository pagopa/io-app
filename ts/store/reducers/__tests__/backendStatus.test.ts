import * as O from "fp-ts/lib/Option";
import { BackendStatus } from "../../../../definitions/content/BackendStatus";
import { LevelEnum } from "../../../../definitions/content/SectionStatus";
import { baseRawBackendStatus } from "../__mock__/backendStatus";
import {
  areSystemsDeadReducer,
  BackendStatusState,
  barcodesScannerConfigSelector,
  isPremiumMessagesOptInOutEnabledSelector,
  isUaDonationsEnabledSelector,
  uaDonationsBannerConfigSelector
} from "../backendStatus";
import { GlobalState } from "../types";

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
  const status: BackendStatus = {
    ...baseRawBackendStatus,
    is_alive: true,
    message: {
      "it-IT": "messaggio in italiano",
      "en-EN": "english message"
    },
    sections: {
      ...baseRawBackendStatus.sections,
      cashback: {
        is_visible: false,
        level: LevelEnum.warning,
        message: {
          "it-IT": "Il cashback è in manutenzione, tornerà operativo a breve",
          "en-EN":
            "Cashback is under maintenance, it will be operational again soon"
        }
      },
      email_validation: {
        is_visible: true,
        level: LevelEnum.warning,
        message: {
          "it-IT":
            "la sezione messaggi è in manutenzione, tornerà operativa a breve",
          "en-EN":
            "the messages section is under maintenance, it will be operational again shortly"
        }
      },
      messages: {
        is_visible: false,
        level: LevelEnum.warning,
        message: {
          "it-IT":
            "la sezione messaggi è in manutenzione, tornerà operativa a breve",
          "en-EN":
            "the messages section is under maintenance, it will be operational again shortly"
        }
      },
      services: {
        is_visible: false,
        level: LevelEnum.critical,
        web_url: {
          "it-IT": "https://io.italia.it/",
          "en-EN": "https://io.italia.it/"
        },
        message: {
          "it-IT":
            "la sezione messaggi è in manutenzione, tornerà operativa a breve",
          "en-EN":
            "the messages section is under maintenance, it will be operational again shortly"
        }
      },
      login: {
        is_visible: false,
        level: LevelEnum.normal,
        web_url: {
          "it-IT": "https://io.italia.it/",
          "en-EN": "https://io.italia.it/"
        },
        message: {
          "it-IT":
            "il sistema di autenticazione è in manutenzione, tornerà operativa a breve",
          "en-EN":
            "the authentication system is under maintenance, it will be operational again shortly"
        }
      },
      wallets: {
        is_visible: false,
        level: LevelEnum.critical,
        web_url: {
          "it-IT": "https://io.italia.it/",
          "en-EN": "https://io.italia.it/"
        },
        message: {
          "it-IT":
            "la sezione portafoglio è in manutenzione, tornerà operativa a breve",
          "en-EN":
            "the wallet section is under maintenance, it will be operational again shortly"
        }
      },
      ingress: {
        is_visible: false,
        level: LevelEnum.critical,
        web_url: {
          "it-IT": "https://io.italia.it/",
          "en-EN": "https://io.italia.it/"
        },
        message: {
          "it-IT":
            "i nostri sistemi potrebbero rispondere con lentezza, ci scusiamo per il disagio",
          "en-EN":
            "our systems may respond slowly, we apologize for the inconvenience"
        }
      },
      credit_card: {
        is_visible: true,
        level: LevelEnum.warning,
        badge: {
          "it-IT": "warning message",
          "en-EN": "possible slowness"
        },
        message: {
          "it-IT": "warning message",
          "en-EN": "possible slowness"
        }
      },
      satispay: {
        is_visible: false,
        level: LevelEnum.critical,
        message: {
          "it-IT": "satispay",
          "en-EN": "satispay"
        }
      },
      bancomat: {
        is_visible: false,
        level: LevelEnum.normal,
        message: {
          "it-IT": "bancomat",
          "en-EN": "bancomat"
        },
        badge: {
          "it-IT": "bancomat badge",
          "en-EN": "bancomat"
        }
      },
      bancomatpay: {
        is_visible: false,
        level: LevelEnum.warning,
        message: {
          "it-IT": "bancomatpay",
          "en-EN": "bancomatpay"
        }
      },
      digital_payments: {
        is_visible: false,
        level: LevelEnum.warning,
        message: {
          "it-IT": "digital_payments",
          "en-EN": "digital_payments"
        }
      }
    }
  };

  const noneStore = {
    backendStatus: {
      status: O.none
    }
  } as any as GlobalState;

  describe("donation selectors", () => {
    it("isUaDonationsEnabledSelector should return false if bs.config.donation.enabled is undefined", () => {
      const donationFeatureFlag = isUaDonationsEnabledSelector(noneStore);
      expect(donationFeatureFlag).toBeFalsy();
    });
    it("isUaDonationsEnabledSelector should return the value of bs.config.donation.enabled if is defined", () => {
      const someFalsyStoreConfig = {
        backendStatus: {
          status: O.some({
            ...status,
            config: {
              ...status.config,
              uaDonations: { ...status.config.uaDonations, enabled: false }
            }
          })
        }
      } as any as GlobalState;
      const falsyConfig = isUaDonationsEnabledSelector(someFalsyStoreConfig);
      expect(falsyConfig).toBeFalsy();
      const someTruthyStoreConfig = {
        backendStatus: {
          status: O.some({
            ...status,
            config: {
              ...status.config,
              uaDonations: { ...status.config.uaDonations, enabled: true }
            }
          })
        }
      } as any as GlobalState;
      const truthyConfig = isUaDonationsEnabledSelector(someTruthyStoreConfig);
      expect(truthyConfig).toBeTruthy();
    });
    it("uaDonationsBannerConfigSelector should return undefined if bs.config.donation.banner is undefined", () => {
      const bannerConfig = uaDonationsBannerConfigSelector(noneStore);
      expect(bannerConfig).toBeUndefined();
    });
    it("uaDonationsBannerConfigSelector should return the banner config if bs.config.donation.banner is defined", () => {
      const someStoreConfig = {
        backendStatus: {
          status: O.some(status)
        }
      } as any as GlobalState;
      const bannerConfig = uaDonationsBannerConfigSelector(someStoreConfig);
      expect(bannerConfig).toEqual(status.config.uaDonations.banner);
    });
  });

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
