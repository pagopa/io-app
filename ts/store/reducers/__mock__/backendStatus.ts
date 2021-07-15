import { some } from "fp-ts/lib/Option";
import { BackendStatusState } from "../backendStatus";
import { BackendStatus } from "../../../../definitions/content/BackendStatus";
import { LevelEnum } from "../../../../definitions/content/SectionStatus";
import { Config } from "../../../../definitions/content/Config";

export const baseRawBackendStatus: BackendStatus = {
  is_alive: true,
  message: {
    "it-IT": "messaggio in italiano",
    "en-EN": "english message"
  },
  sections: {
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
    },
    cobadge: {
      is_visible: false,
      level: LevelEnum.warning,
      message: {
        "it-IT": "cobadge",
        "en-EN": "cobadge"
      }
    },
    euCovidCert: {
      is_visible: false,
      level: LevelEnum.warning,
      message: {
        "it-IT": "euCovidCert banner test",
        "en-EN": "euCovidCert banner test"
      }
    },
    favourite_language: {
      is_visible: false,
      level: LevelEnum.warning,
      message: {
        "it-IT": "favourite_language banner test",
        "en-EN": "favourite_language banner test"
      }
    }
  },
  config: {
    bpd: {
      enroll_bpd_after_add_payment_method: false,
      program_active: true
    },
    bpd_ranking: true,
    bpd_ranking_v2: true,
    cgn_merchants_v2: false
  }
};

export const baseBackendState: BackendStatusState = {
  status: some(baseRawBackendStatus),
  areSystemsDead: false,
  deadsCounter: 0
};

export const baseBackendConfig: Config = {
  bpd: {
    enroll_bpd_after_add_payment_method: false,
    program_active: true
  },
  bpd_ranking: true,
  bpd_ranking_v2: true,
  cgn_merchants_v2: true
};

export const withBpdRankingConfig = (
  baseState: BackendStatusState,
  newConfig: Config
): BackendStatusState => ({
  ...baseState,
  status: baseState.status.map(s => ({
    ...s,
    config: { ...newConfig }
  }))
});
