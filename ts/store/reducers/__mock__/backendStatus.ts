import { some } from "fp-ts/lib/Option";
import { BackendStatus } from "../../../types/backendStatus";
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
      level: "warning",
      message: {
        "it-IT": "Il cashback è in manutenzione, tornerà operativo a breve",
        "en-EN":
          "Cashback is under maintenance, it will be operational again soon"
      }
    },
    email_validation: {
      is_visible: true,
      level: "warning",
      message: {
        "it-IT":
          "la sezione messaggi è in manutenzione, tornerà operativa a breve",
        "en-EN":
          "the messages section is under maintenance, it will be operational again shortly"
      }
    },
    messages: {
      is_visible: false,
      level: "warning",
      message: {
        "it-IT":
          "la sezione messaggi è in manutenzione, tornerà operativa a breve",
        "en-EN":
          "the messages section is under maintenance, it will be operational again shortly"
      }
    },
    services: {
      is_visible: false,
      level: "critical",
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
      level: "normal",
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
      level: "critical",
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
      level: "critical",
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
      level: "warning",
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
      level: "critical",
      message: {
        "it-IT": "satispay",
        "en-EN": "satispay"
      }
    },
    bancomat: {
      is_visible: false,
      level: "normal",
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
      level: "warning",
      message: {
        "it-IT": "bancomatpay",
        "en-EN": "bancomatpay"
      }
    },
    digital_payments: {
      is_visible: false,
      level: "warning",
      message: {
        "it-IT": "digital_payments",
        "en-EN": "digital_payments"
      }
    }
  }
};

export const baseBackendState: BackendStatusState = {
  status: some(baseRawBackendStatus),
  areSystemsDead: false,
  deadsCounter: 0
};

export const withBpdRankingConfig = (
  baseState: BackendStatusState,
  newConfig: boolean
): BackendStatusState => ({
  ...baseState,
  status: baseState.status.map(s => ({
    ...s,
    config: { bpd_ranking: newConfig }
  }))
});
