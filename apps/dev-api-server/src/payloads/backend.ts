import { ToolEnum } from "@io-app/api-types/generated/definitions/content/AssistanceToolConfig";
import { BackendStatus } from "@io-app/api-types/generated/definitions/content/BackendStatus";
import { LevelEnum } from "@io-app/api-types/generated/definitions/content/SectionStatus";

import { baseRelyingPartyPath } from "../features/fims/services/relyingPartyService";
import {
  sendOptInServiceId,
  sendServiceId
} from "../features/pn/services/dataService";
import { serverUrl } from "../utils/server";

export const backendInfo = {
  min_app_version: { android: "1.27.0", ios: "1.27.0" },
  min_app_version_pagopa: { android: "0.0.0", ios: "0.0.0" },
  version: "2.1.2"
};

// ref https://assets.io.pagopa.it/status/backend.json
export const backendStatus: BackendStatus = {
  is_alive: true,
  message: {
    "it-IT": "",
    "en-EN": "English message",
    "de-DE": ""
  },
  statusMessages: {
    items: []
  },
  config: {
    bpd_ranking: false,
    bpd_ranking_v2: true,
    cgn_merchants_v2: false,
    payments: {},
    bpd: {
      enroll_bpd_after_add_payment_method: false,
      program_active: true,
      opt_in_payment_methods: false,
      opt_in_payment_methods_v2: true
    },
    assistanceTool: {
      tool: ToolEnum.zendesk
    },
    paypal: {
      enabled: true
    },
    bancomatPay: {
      display: true,
      onboarding: true,
      payment: true
    },
    cgn: {
      enabled: true,
      merchants_v2: false,
      show_cgn_categories_modal: {
        android: "5.0.0.0",
        ios: "5.0.0.0"
      },
      show_cgn_engagement_banner: {
        min_app_version: {
          android: "1.0.0.0",
          ios: "1.0.0.0"
        },
        description: {
          "it-IT":
            "Ottieni in pochi tap la tua Carta Giovani Nazionale. È gratis!",
          "en-EN":
            "Ottieni in pochi tap la tua Carta Giovani Nazionale. È gratis!",
          "de-DE":
            "Ottieni in pochi tap la tua Carta Giovani Nazionale. È gratis!"
        },
        title: {
          "it-IT": "Sblocca tante opportunità dedicate a te!",
          "en-EN": "Sblocca tante opportunità dedicate a te!",
          "de-DE": "Sblocca tante opportunità dedicate a te!"
        },
        action: {
          label: {
            "it-IT": "Attiva Carta Giovani",
            "en-EN": "Attiva Carta Giovani",
            "de-DE": "Attiva Carta Giovani"
          },
          url: ""
        }
      },
      eyca_base_url: "https://eyca.org",
      eyca_discount_url: "https://eyca.org/discounts?country=IT"
    },
    fse: {
      landingBanner: {
        is_dismissable: true,
        engagement_url:
          "https://www.fascicolosanitario.gov.it/portale/accedi-al-fascicolo"
      }
    },
    fims: {
      domain: `${serverUrl}/fims/provider/`,
      enabled: true,
      min_app_version: {
        android: "2.68.0.0",
        ios: "2.68.0.0"
      },
      historyEnabled: true,
      services: [
        {
          configuration_id: "iPatente",
          service_id: "01JEXVQSRV2XRX9XDWQ5XQ6A8T",
          organization_fiscal_code: "97532760580",
          organization_name: "Ministero delle infrastrutture e dei trasporti",
          service_name: "Motorizzazione Civile - Le mie patenti"
        },
        {
          configuration_id: "cdc-onboarding",
          service_id: "01JV4M365CHAZN5C0FDR62DCVD",
          service_name: "Carta della Cultura - Onboarding"
        }
      ],
      iOSCookieDisabledServiceIds: ["01JV4M365CHAZN5C0FDR62DCVD"]
    },
    premiumMessages: {
      opt_in_out_enabled: true
    },
    cdc: {
      enabled: true
    },
    cdcV2: {
      min_app_version: {
        android: "2.68.0.0",
        ios: "2.68.0.0"
      },
      cta_onboarding_config: {
        url: `${serverUrl}${baseRelyingPartyPath()}/2/landingPage`,
        includeDeviceId: true
      },
      walletVisibility: {
        min_app_version: {
          ios: "3.18.0.0",
          android: "3.18.0.0"
        },
        configurations: {
          url: `${serverUrl}${baseRelyingPartyPath()}/2/landingPage`,
          includeDeviceId: true
        }
      }
    },
    barcodesScanner: {
      dataMatrixPosteEnabled: true
    },
    fci: {
      enabled: true,
      min_app_version: {
        ios: "1.2.3",
        android: "1.2.3"
      },
      security_level_check: {
        min_app_version: {
          ios: "3.40.0.0",
          android: "3.40.0.0"
        },
        helpCenter_url:
          "https://assistenza.ioapp.it/hc/it/articles/30722976684049-Cosa-sono-i-livelli-di-sicurezza"
      }
    },
    lollipop: {
      enabled: false,
      min_app_version: {
        ios: "0.0.0",
        android: "0.0.0"
      }
    },
    pn: {
      enabled: true,
      min_app_version: {
        ios: "2.35.0.1",
        android: "2.35.0.1"
      },
      frontend_url:
        "https://cittadini.notifichedigitali.it/?utm_source=ioapp&utm_medium=app&utm_campaign=accesso_send",
      optInServiceId: sendOptInServiceId,
      notificationServiceId: sendServiceId,
      tos_url: "https://cittadini.notifichedigitali.it/termini-di-servizio",
      privacy_url: "https://cittadini.notifichedigitali.it/informativa-privacy",
      aarQRCodeRegex:
        "^\\s*https:\\/\\/(cittadini|login)\\.(uat\\.)?notifichedigitali\\.it(\\/[^?]*)?\\?aar=[^\\s]+",
      aar: {
        min_app_version: {
          ios: "3.13.0.0",
          android: "3.13.0.0"
        },
        delegate_url:
          "https://assistenza.notifichedigitali.it/hc/it/articles/32453819931537-Delegare-qualcuno-a-visualizzare-le-tue-notifiche",
        in_app_delegation: {
          helpCenter_url:
            "https://assistenza.ioapp.it/hc/it/articles/44040451905809-Come-fare-per-accedere-a-una-notifica-SEND-destinata-a-un-altra-persona",
          min_app_version: {
            ios: "3.18.0.0",
            android: "3.18.0.0"
          }
        },
        feedbackBanner: {
          min_app_version: {
            ios: "3.27.0.0",
            android: "3.27.0.0"
          },
          title: {
            "it-IT": "Puoi dirci com'è andata?",
            "en-EN": ""
          },
          description: {
            "it-IT":
              "Raccontaci la tua esperienza con la notifica e aiutaci a migliorare.",
            "en-EN": ""
          },
          action: {
            label: {
              "it-IT": "Vai al sondaggio",
              "en-EN": ""
            },
            url: "https://pagopa.qualtrics.com/jfe/form/SV_3Da8BtgDTrrnAlo"
          }
        }
      },
      abstractShown: false,
      customerServiceCenterUrl: "https://assistenza.notifichedigitali.it/hc",
      estimateTimelinesUrl: "https://notifichedigitali.it/perfezionamento",
      visitTheSENDWebsiteUrl:
        "https://cittadini.notifichedigitali.it/auth/login",
      lollipopPlaygroundEnabled: true
    },
    idPay: {
      min_app_version: {
        ios: "1.2.3",
        android: "1.2.3"
      },
      onboarding: {
        enabled: true,
        min_app_version: {
          ios: "3.0.0",
          android: "3.0.0"
        }
      },
      initiative_details: {
        enabled: true,
        min_app_version: {
          ios: "3.0.0",
          android: "3.0.0"
        }
      },
      cie_payments: {
        min_app_version: {
          ios: "4.0.0",
          android: "4.0.0"
        }
      },
      scan_screen: {
        min_app_version: {
          ios: "4.0.0",
          android: "4.0.0"
        }
      },
      qr_code_payments: {
        min_app_version: {
          ios: "4.0.0",
          android: "4.0.0"
        }
      },
      initiative_config_map: {
        TESTINIT19: {
          min_app_version: {
            ios: "0.0.0.0",
            android: "0.0.0.0"
          },
          cac: {
            "it-IT":
              "https://assistenza.ioapp.it/hc/it/articles/35337442750225-Non-riesco-ad-aggiungere-un-metodo-di-pagamento",
            "en-EN":
              "https://assistenza.ioapp.it/hc/it/articles/35337442750225-Non-riesco-ad-aggiungere-un-metodo-di-pagamento"
          }
        }
      }
    },
    newPaymentSection: {
      enabled: false,
      min_app_version: {
        ios: "0.0.0",
        android: "0.0.0"
      },
      feedbackBanner: {
        min_app_version: {
          ios: "2.65.0.0",
          android: "2.65.0.0"
        },
        title: {
          "it-IT": "Puoi dirci com'è andata?",
          "en-EN": "Can you tell us how it went?"
        },
        description: {
          "it-IT":
            "Raccontaci la tua esperienza con il pagamento e aiutaci a migliorare.",
          "en-EN":
            "Tell us about your experience with payment and help us improve."
        },
        action: {
          label: {
            "it-IT": "Vai al sondaggio",
            "en-EN": "Go to survey"
          },
          url: "https://io.italia.it/diccilatua/ces-pagamento"
        }
      },
      pspBanner: {
        MYBANK: {
          min_app_version: {
            ios: "2.65.0.0",
            android: "2.65.0.0"
          },
          title: {
            "it-IT": "Non trovi la tua banca?",
            "en-EN": "You don't find your bank?"
          },
          description: {
            "it-IT":
              "Non preoccuparti: dovrai selezionarla nei passaggi successivi.",
            "en-EN":
              "Don't worry: you will have to select it in the next steps."
          }
        }
      },
      webViewPaymentFlow: {
        min_app_version: {
          ios: "2.65.0.0",
          android: "2.65.0.0"
        }
      }
    },
    fastLogin: {
      min_app_version: {
        ios: "0.0.0",
        android: "0.0.0"
      },
      opt_in: {
        min_app_version: {
          ios: "0.0.0",
          android: "0.0.0"
        }
      }
    },
    loginConfig: {
      notifyExpirationThreshold: {
        fastLogin: 15
      },
      activeSessionLogin: {
        min_app_version: {
          ios: "0.0.0",
          android: "0.0.0"
        }
      }
    },
    emailUniquenessValidation: {
      min_app_version: {
        ios: "0.0.0",
        android: "0.0.0"
      }
    },
    nativeLogin: {
      min_app_version: {
        ios: "0.0.0",
        android: "0.0.0"
      }
    },
    tos: {
      tos_version: 4.91,
      tos_url: "https://io.italia.it/app-content/tos_privacy.html?v=4.91"
    },
    absolutePortalLinks: {
      io_web: "https://ioapp.it/",
      io_showcase: "https://io.italia.it/"
    },
    itw: {
      enabled: true,
      min_app_version: {
        ios: "2.66.0.0",
        android: "2.66.0.0"
      },
      ipatente_cta_visible: true,
      feedback_banner_visible: true
    },
    landing_banners: {
      priority_order: [
        "FSE_ENGAGEMENT_BANNER",
        "OS_DISMISSION_REMINDER",
        "PUSH_NOTIFICATIONS_REMINDER",
        "SEND_ACTIVATION_REMINDER",
        "LV_EXPIRATION_REMINDER",
        "ITW_DISCOVERY",
        "INVALID_ID"
      ]
    },
    app_feedback: {
      min_app_version: {
        ios: "2.0.0.0",
        android: "2.0.0.0"
      },
      feedback_uri: {
        general: "https://pagopa.qualtrics.com/jfe/form/SV_dg0CZHTfsBN56aG",
        payments: "https://pagopa.qualtrics.com/jfe/form/SV_0HrNTh9QPOcYKma",
        itw: "https://pagopa.qualtrics.com/jfe/form/SV_3sMkRc6Jg9aarhY"
      }
    },
    messages_feedback_banner: {
      min_app_version: {
        ios: "3.0.0.0",
        android: "3.0.0.0"
      },
      feedback_uri: "https://pagopa.qualtrics.com/jfe/form/SV_0VCZTkYbfozt9ki"
    },
    zendeskCacBanner: {
      min_app_version: {
        ios: "0.0.0.0",
        android: "0.0.0.0"
      },
      title: {
        "it-IT": "Serve aiuto?",
        "en-EN": "Serve aiuto?",
        "de-DE": "Serve aiuto?"
      },
      description: {
        "it-IT":
          "Abbiamo preparato una guida per aiutarti a risolvere velocemente il tuo problema.",
        "en-EN":
          "Abbiamo preparato una guida per aiutarti a risolvere velocemente il tuo problema.",
        "de-DE":
          "Abbiamo preparato una guida per aiutarti a risolvere velocemente il tuo problema."
      },
      action: {
        label: {
          "it-IT": "Vai al Centro assistenza",
          "en-EN": "Vai al Centro assistenza",
          "de-DE": "Vai al Centro assistenza"
        },
        url: {
          "it-IT": "https://assistenza.ioapp.it/hc/it",
          "en-EN": "https://assistenza.ioapp.it/hc/it",
          "de-DE": "https://assistenza.ioapp.it/hc/it"
        }
      }
    },
    services: {
      favouriteServices: {
        limit: 20,
        min_app_version: {
          android: "3.21.0.0",
          ios: "3.21.0.0"
        }
      }
    },
    min_supported_os: {
      ios: "15.1",
      android: "26"
    }
  },
  sections: {
    email_validation: {
      is_visible: false,
      level: LevelEnum.critical,
      web_url: {
        "it-IT": "https://io.italia.it/status/#2012081628",
        "en-EN": "https://io.italia.it/status/en/#2012081628",
        "de-DE": ""
      },
      message: {
        "it-IT":
          "Il messaggio di validazione indirizzo email potrebbe arrivare dopo diverse ore.",
        "en-EN": "The email validation message may arrive after several hours.",
        "de-DE": ""
      }
    },
    cashback: {
      is_visible: true,
      level: LevelEnum.warning,
      web_url: {
        "it-IT": "https://io.italia.it/cashback",
        "en-EN": "https://io.italia.it/cashback",
        "de-DE": ""
      },
      message: {
        "it-IT": "L’iniziativa del Cashback si è conclusa.",
        "en-EN": "The Cashback initiative has ended.",
        "de-DE": ""
      }
    },
    cdc: {
      is_visible: false,
      level: LevelEnum.warning,
      message: {
        "it-IT": "",
        "en-EN": "",
        "de-DE": ""
      },
      badge: {
        "it-IT": "",
        "en-EN": "",
        "de-DE": ""
      }
    },
    cgn: {
      is_visible: false,
      level: LevelEnum.warning,
      message: {
        "it-IT": "",
        "en-EN": "",
        "de-DE": ""
      },
      badge: {
        "it-IT": "",
        "en-EN": "",
        "de-DE": ""
      }
    },
    fims: {
      is_visible: false,
      level: LevelEnum.warning,
      message: {
        "it-IT": "",
        "en-EN": "",
        "de-DE": ""
      },
      badge: {
        "it-IT": "",
        "en-EN": "",
        "de-DE": ""
      }
    },
    messages: {
      is_visible: false,
      level: LevelEnum.warning,
      message: {
        "it-IT":
          "Ci sono dei problemi con la visualizzazione delle Certificazioni Verdi. I tecnici sono al lavoro per ripristinare il servizio.",
        "en-EN":
          "We’re having issues showing EU digital COVID certificates. Technicians are working to restore service.",
        "de-DE": ""
      }
    },
    services: {
      is_visible: false,
      level: LevelEnum.warning,
      message: {
        "it-IT":
          "Stiamo aggiornando i servizi locali. La lista tornerà presto disponibile.",
        "en-EN": "We're updating local services. The list will be back soon.",
        "de-DE": ""
      }
    },
    login: {
      is_visible: false,
      level: LevelEnum.warning,
      message: {
        "it-IT":
          "I nostri sistemi potrebbero rispondere con lentezza, ci scusiamo per il disagio.",
        "en-EN":
          "Our systems may respond slowly, we apologize for the inconvenience.",
        "de-DE": ""
      }
    },
    wallets: {
      is_visible: false,
      level: LevelEnum.warning,
      message: {
        "it-IT": "Dalle 20:30 alle 22:40 non sarà possibile pagare con PayPal.",
        "en-EN": "PayPal services won't be available from 8:30 to 10:40 PM.",
        "de-DE": ""
      }
    },
    payments: {
      is_visible: false,
      level: LevelEnum.critical,
      message: {
        "it-IT": "Dalle 20:30 alle 22:40 non sarà possibile pagare con PayPal.",
        "en-EN": "PayPal services won't be available from 8:30 to 10:40 PM.",
        "de-DE": ""
      },
      web_url: {
        "it-IT": "https://io.italia.it/status/#2012081628",
        "en-EN": "https://io.italia.it/status/en/#2012081628",
        "de-DE": ""
      }
    },
    ingress: {
      is_visible: false,
      level: LevelEnum.warning,
      message: {
        "it-IT":
          "I nostri sistemi potrebbero rispondere con lentezza, ci scusiamo per il disagio.",
        "en-EN":
          "Our systems may respond slowly, we apologize for the inconvenience.",
        "de-DE": ""
      }
    },
    bancomat: {
      is_visible: false,
      level: LevelEnum.normal,
      message: {
        "it-IT": "",
        "en-EN": "",
        "de-DE": ""
      },
      badge: {
        "it-IT": "",
        "en-EN": "",
        "de-DE": ""
      }
    },
    satispay: {
      is_visible: false,
      level: LevelEnum.normal,
      message: {
        "it-IT": "",
        "en-EN": "",
        "de-DE": ""
      },
      badge: {
        "it-IT": "",
        "en-EN": "",
        "de-DE": ""
      }
    },
    bancomatpay: {
      is_visible: false,
      level: LevelEnum.normal,
      message: {
        "it-IT": "",
        "en-EN": "",
        "de-DE": ""
      },
      badge: {
        "it-IT": "",
        "en-EN": "",
        "de-DE": ""
      }
    },
    credit_card: {
      is_visible: false,
      level: LevelEnum.warning,
      message: {
        "it-IT":
          "Per il grande numero di richieste, la verifica della tua carta potrebbe subire dei rallentamenti",
        "en-EN":
          "Due to the big number of requests, the card verification process may be slowed down",
        "de-DE": ""
      },
      badge: {
        "it-IT": "possibili rallentamenti",
        "en-EN": "possible slowdowns",
        "de-DE": ""
      }
    },
    paypal: {
      is_visible: false,
      level: LevelEnum.warning,
      message: {
        "it-IT": "",
        "en-EN": "",
        "de-DE": ""
      },
      badge: {
        "it-IT": "",
        "en-EN": "",
        "de-DE": ""
      }
    },
    digital_payments: {
      is_visible: false,
      level: LevelEnum.normal,
      message: {
        "it-IT": "",
        "en-EN": "",
        "de-DE": ""
      },
      badge: {
        "it-IT": "",
        "en-EN": "",
        "de-DE": ""
      }
    },
    cobadge: {
      is_visible: false,
      level: LevelEnum.normal,
      message: {
        "it-IT": "",
        "en-EN": "",
        "de-DE": ""
      },
      badge: {
        "it-IT": "",
        "en-EN": "",
        "de-DE": ""
      }
    },
    euCovidCert: {
      is_visible: false,
      level: LevelEnum.warning,
      message: {
        "it-IT":
          "Ci sono dei problemi con la visualizzazione delle Certificazioni Verdi. I tecnici sono al lavoro per ripristinare il servizio.",
        "en-EN":
          "We’re having issues showing EU digital COVID certificates. Technicians are working to restore service.",
        "de-DE": ""
      }
    },
    favourite_language: {
      is_visible: true,
      level: LevelEnum.normal,
      web_url: {
        "it-IT": "https://github.com/pagopa/io-app/issues/new/choose",
        "en-EN": "https://github.com/pagopa/io-app/issues/new/choose",
        "de-DE": ""
      },
      message: {
        "it-IT": "La traduzione in tedesco è in corso. Contribuisci su GitHub!",
        "en-EN": "German translation is in progress. Contribute on GitHub!",
        "de-DE": ""
      }
    },
    app_update_required: {
      is_visible: false,
      level: LevelEnum.normal,
      web_url: {
        "it-IT": "",
        "en-EN": "",
        "de-DE": ""
      },
      message: {
        "it-IT": "",
        "en-EN": "",
        "de-DE": ""
      }
    }
  }
};
