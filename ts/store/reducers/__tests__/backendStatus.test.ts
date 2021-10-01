import { none, some } from "fp-ts/lib/Option";
import {
  areSystemsDeadReducer,
  BackendStatusState,
  bpdRankingEnabledSelector,
  sectionStatusSelector
} from "../backendStatus";
import { GlobalState } from "../types";
import { BackendStatus } from "../../../../definitions/content/BackendStatus";
import { baseRawBackendStatus } from "../__mock__/backendStatus";
import { LevelEnum } from "../../../../definitions/content/SectionStatus";

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
    status: none,
    areSystemsDead: false,
    deadsCounter: 0
  };

  it("should decode the backend status", () => {
    const newState = areSystemsDeadReducer(currentState, responseON);
    expect(newState.areSystemsDead).toBeFalsy();
    expect(newState.deadsCounter).toEqual(0);
    expect(newState.status.isSome()).toBeTruthy();
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

  const someStore = {
    backendStatus: {
      status: some(status)
    }
  } as any as GlobalState;

  const noneStore = {
    backendStatus: {
      status: none
    }
  } as any as GlobalState;

  it("should return the cashback status", () => {
    const section = sectionStatusSelector("cashback")(someStore);
    expect(section).not.toBeNull();
    expect(section).toEqual(status.sections.cashback);
  });

  it("should return undefined - sectionStatusSelector", () => {
    const section = sectionStatusSelector("cashback")(noneStore);
    expect(section).toBeUndefined();
  });

  it("should return undefined - configSelector", () => {
    const config = bpdRankingEnabledSelector(noneStore);
    expect(config).toBeUndefined();
  });

  it("should return true - someStoreConfig", () => {
    const someStoreConfig = {
      backendStatus: {
        status: some({ ...status, config: { bpd_ranking_v2: true } })
      }
    } as any as GlobalState;
    const bpd_ranking = bpdRankingEnabledSelector(someStoreConfig);
    expect(bpd_ranking).toBeTruthy();
  });

  it("should return false - someStoreConfig", () => {
    const someStoreConfig = {
      backendStatus: {
        status: some({ ...status, config: { bpd_ranking_v2: false } })
      }
    } as any as GlobalState;
    const bpd_ranking = bpdRankingEnabledSelector(someStoreConfig);
    expect(bpd_ranking).toBeFalsy();
  });
});
