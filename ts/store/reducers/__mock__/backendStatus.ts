import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { ToolEnum } from "../../../../definitions/content/AssistanceToolConfig";
import { BackendStatus } from "../../../../definitions/content/BackendStatus";
import { Config } from "../../../../definitions/content/Config";
import { LevelEnum } from "../../../../definitions/content/SectionStatus";
import { BackendStatusState } from "../backendStatus";

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
    paypal: {
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
    },
    app_update_required: {
      is_visible: true,
      level: LevelEnum.normal,
      web_url: {
        "it-IT": "",
        "en-EN": ""
      },
      message: {
        "it-IT": "aggiornamento richiesto",
        "en-EN": "update required"
      }
    },
    cgn: {
      is_visible: true,
      level: LevelEnum.normal,
      web_url: {
        "it-IT": "",
        "en-EN": ""
      },
      message: {
        "it-IT": "aggiornamento richiesto",
        "en-EN": "update required"
      }
    },
    fims: {
      is_visible: true,
      level: LevelEnum.normal,
      web_url: {
        "it-IT": "",
        "en-EN": ""
      },
      message: {
        "it-IT": "aggiornamento richiesto",
        "en-EN": "update required"
      }
    }
  },
  config: {
    premiumMessages: {
      opt_in_out_enabled: false
    },
    bpd: {
      enroll_bpd_after_add_payment_method: false,
      program_active: true,
      opt_in_payment_methods: false,
      opt_in_payment_methods_v2: false
    },
    bpd_ranking: true,
    bpd_ranking_v2: true,
    cgn_merchants_v2: false,
    assistanceTool: {
      tool: ToolEnum.none
    },
    paypal: {
      enabled: false
    },
    bancomatPay: {
      display: true,
      onboarding: true,
      payment: false
    },
    cgn: {
      enabled: true,
      merchants_v2: false
    },
    uaDonations: {
      enabled: false,
      banner: {
        visible: false,
        description: {
          "it-IT": "descrizione mock banner",
          "en-EN": "mock banner description"
        },
        url: "mockbannerurl"
      }
    },
    fims: {
      enabled: false,
      domain: "mockFimsDomain"
    },
    cdc: {
      enabled: false
    },
    barcodesScanner: {
      dataMatrixPosteEnabled: false
    },
    fci: {
      enabled: false,
      min_app_version: {
        android: "0.0.0.0",
        ios: "0.0.0.0"
      }
    },
    idPay: {
      min_app_version: {
        android: "0.0.0.0",
        ios: "0.0.0.0"
      }
    },
    lollipop: {
      enabled: false,
      min_app_version: {
        android: "0.0.0.0",
        ios: "0.0.0.0"
      }
    },
    pn: {
      enabled: false,
      frontend_url: "",
      optInServiceId: ""
    },
    payments: {}
  }
};

export const baseBackendState: BackendStatusState = {
  status: O.some(baseRawBackendStatus),
  areSystemsDead: false,
  deadsCounter: 0
};

export const baseBackendConfig: Config = {
  premiumMessages: {
    opt_in_out_enabled: false
  },
  bpd: {
    enroll_bpd_after_add_payment_method: false,
    program_active: true,
    opt_in_payment_methods: false,
    opt_in_payment_methods_v2: false
  },
  bpd_ranking: true,
  bpd_ranking_v2: true,
  cgn_merchants_v2: true,
  assistanceTool: {
    tool: ToolEnum.none
  },
  paypal: {
    enabled: false
  },
  bancomatPay: {
    display: true,
    onboarding: true,
    payment: false
  },
  cgn: {
    enabled: true,
    merchants_v2: false
  },
  uaDonations: {
    enabled: false,
    banner: {
      visible: false,
      description: {
        "it-IT": "descrizione mock banner",
        "en-EN": "mock banner description"
      },
      url: "mockbannerurl"
    }
  },
  fims: {
    enabled: false,
    domain: "mockFimsDomain"
  },
  cdc: {
    enabled: false
  },
  barcodesScanner: {
    dataMatrixPosteEnabled: false
  },
  fci: {
    enabled: false,
    min_app_version: {
      android: "0.0.0.0",
      ios: "0.0.0.0"
    }
  },
  idPay: {
    min_app_version: {
      android: "0.0.0.0",
      ios: "0.0.0.0"
    }
  },
  lollipop: {
    enabled: false,
    min_app_version: {
      android: "0.0.0.0",
      ios: "0.0.0.0"
    }
  },
  pn: {
    enabled: false,
    frontend_url: "",
    optInServiceId: ""
  },
  payments: {}
};

export const withBpdRankingConfig = (
  baseState: BackendStatusState,
  newConfig: Config
): BackendStatusState => ({
  ...baseState,
  status: pipe(
    baseState.status,
    O.map(s => ({
      ...s,
      config: { ...newConfig }
    }))
  )
});
