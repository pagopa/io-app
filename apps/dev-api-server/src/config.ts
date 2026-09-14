import { EmailAddress } from "@io-app/api-types/generated/definitions/identity/EmailAddress";
import { PreferredLanguageEnum } from "@io-app/api-types/generated/definitions/identity/PreferredLanguage";
import { PushNotificationsContentTypeEnum } from "@io-app/api-types/generated/definitions/identity/PushNotificationsContentType";
import { ReminderStatusEnum } from "@io-app/api-types/generated/definitions/identity/ReminderStatus";
import { TrialId } from "@io-app/api-types/generated/definitions/trial_system/TrialId";
import { NonNegativeNumber } from "@pagopa/ts-commons/lib/numbers";
import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import { FiscalCode, NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import chalk from "chalk";
import * as E from "fp-ts/lib/Either";
import _ from "lodash";
import * as path from "path";

import {
  IoDevServerConfig,
  ProfileAttrs,
  WalletMethodConfig
} from "./types/config";
import { readFileAsJSON } from "./utils/file";
import { serverUrl } from "./utils/server";

export const staticContentRootPath = "/static_contents";
const root = path.resolve(".");
export const assetsFolder = path.join(root, "assets");
const configFolder = path.join(root, "config");

const defaultProfileAttrs: ProfileAttrs = {
  name: "Maria Giovanna",
  family_name: "Rossi",
  mobile: "5555555555" as NonEmptyString,
  fiscal_code: "RSSMGV80A41H501I" as FiscalCode,
  email: "maria.giovanna.rossi@email.it" as EmailAddress,
  accepted_tos_version: 4.91 as NonNegativeNumber,
  preferred_languages: [PreferredLanguageEnum.it_IT],
  reminder_status: ReminderStatusEnum.ENABLED,
  push_notifications_content_type: PushNotificationsContentTypeEnum.FULL
};

const paymentMethods: WalletMethodConfig = {
  walletBancomatCount: 0,
  walletCreditCardCount: 1,
  walletCreditCardCoBadgeCount: 0,
  privativeCount: 0,
  satispayCount: 0,
  paypalCount: 1,
  bPayCount: 1,
  citizenSatispay: true,
  citizenBancomatCount: 1,
  citizenBPayCount: 1,
  citizenCreditCardCoBadgeCount: 1,
  citizenPrivative: true,
  citizenPaypal: true
};

/**
 * default config to setup dev-server
 * warning: you should not edit this file (neither commit). Instead you should add or edit the json config file (see 'config' folder)
 */
const defaultConfig: IoDevServerConfig = {
  global: {
    delay: 0,
    autoLogin: false,
    allowRandomValues: true,
    responseError: undefined,
    logSAMLRequest: false,
    sendSessionTokenAsQueryParam: false
  },
  profile: {
    attrs: defaultProfileAttrs,
    authenticationProvider: "spid",
    firstOnboarding: false,
    allowRandomValues: true
  },
  messages: {
    response: {
      getMessagesResponseCode: 200,
      getMessageResponseCode: 200,
      getThirdPartyMessageResponseCode: 200
    },
    messageTemplateWrappers: [
      {
        count: 1,
        template: {
          subjectWordCount: 5,
          hasPreconditions: "NEVER",
          hasRemoteContent: true,
          attachmentCount: 5
        }
      }
    ],
    paymentsCount: 1,
    paymentInvalidAfterDueDateWithValidDueDateCount: 0,
    paymentInvalidAfterDueDateWithExpiredDueDateCount: 0,
    paymentWithValidDueDateCount: 0,
    paymentWithExpiredDueDateCount: 0,
    fci: {
      waitForSignatureCount: 0,
      rejectedCount: 0,
      expiredCount: 0,
      expired90Count: 0,
      waitForQtspCount: 0,
      signedCount: 0,
      canceledCount: 0,
      noSignatureFieldsCount: 0,
      response: {
        getFciResponseCode: 200,
        documentExpirationDurationSeconds: 5 * 60, // make it 30 to allow testing expired documents without waiting too much
        nonceDurationSeconds: 5 * 60 // 5 minutes as production environment
      }
    },
    withCTA: false,
    generateLegacyGreenPassMessage: true,
    withValidDueDateCount: 0,
    withInValidDueDateCount: 0,
    // sending 2 messages at minimum to allow for basic pagination
    standardMessageCount: 2,
    archivedMessageCount: 1,
    useMessagesSavedUnderConfig: false,
    // atm it has effect only on message flow (pr welcome)
    allowRandomValues: true
  },
  send: {
    isServiceUpsertRateLimited: false,
    aarQRCodeUrl: "https://cittadini.notifichedigitali.it/io",
    lollipopLambdaResponseCode: 200,
    mandateTimeToLiveSeconds: 120,
    paymentDocumentExpirationTimeSeconds: 10,
    paymentDocumentGenerationTimeSeconds: 3,
    paymentDocumentRetryAfterSeconds: 2,
    prevalidatedUrlDurationSeconds: 30,
    sendAARs: [
      { iun: "SEND-SEND-SEND-000000-A-0" },
      { iun: "SEND-SEND-SEND-000001-A-0" },
      { iun: "SEND-SEND-SEND-000002-A-0" },
      { iun: "SEND-SEND-SEND-000003-A-0" },
      { iun: "SEND-SEND-SEND-000004-A-0" }
    ],
    sendMandates: [{ iun: "SEND-SEND-SEND-000003-A-0" }],
    sendMessages: [
      { iun: "SEND-SEND-SEND-000001-A-0", ioTitle: "Avviso di ingiunzione" },
      {
        iun: "SEND-SEND-SEND-000002-A-0",
        ioTitle: "Nuovo avviso di ingiunzione"
      }
    ],
    sendNotifications: [
      {
        attachments: ["DOCUMENT", "F24", "F24"],
        cancelled: true,
        iun: "SEND-SEND-SEND-000001-A-0",
        payments: [
          "TOPAY",
          "TOPAY",
          "EXPIRED",
          "PAID",
          "FAILED",
          "FAILED",
          "UNRELATED"
        ],
        subject: "Avviso di ingiunzione - cancellato"
      },
      {
        attachments: ["DOCUMENT", "F24", "DOCUMENT"],
        iun: "SEND-SEND-SEND-000002-A-0",
        payments: [
          "TOPAY",
          "TOPAY",
          "EXPIRED",
          "PAID",
          "FAILED",
          "FAILED",
          "UNRELATED"
        ],
        subject: "Nuovo avviso di ingiunzione"
      },
      {
        abstract:
          "Gentile Utente,\nogni anno l'Agenzia dei Controlli esegue delle verifiche automatizzate sulle dichiarazioni presentate per verificare che i dati in esse indicati siano corretti e che i versamenti siano stati effettuati esattamente e nei termini previsti.\n\nLe comunichiamo che, dai controlli effettuati sulla sua dichiarazione, sono emerse alcune incongruenze.",
        attachments: ["F24", "DOCUMENT", "F24"],
        iun: "SEND-SEND-SEND-000003-A-0",
        payments: ["PAID", "UNRELATED", "TOPAY"],
        senderDenomination: "Agenzia dei Controlli",
        subject: "Controllo dichiarazione completato",
        userIsRecipient: false
      },
      {
        attachments: ["F24", "DOCUMENT"],
        iun: "SEND-SEND-SEND-000004-A-0",
        payments: ["TOPAY"],
        userIsRecipient: false
      }
    ],
    sendOptInMessage: true,
    skipLollipopVerification: false,
    skipServerToServerAuthentication: false,
    validationCodeTimeToLiveSeconds: 60
  },
  wallet: {
    methods: paymentMethods,
    shuffleAbi: true,
    verificaError: undefined,
    attivaError: undefined,
    // atm it has no effect (pr welcome)
    allowRandomValues: true,
    payment: undefined,
    // success (0 outcome code)
    onboardingCreditCardOutCode: 0,
    // success (0 outcome code)
    onboardingPaypalOutCode: 0,
    // success (0 outcome code)
    paymentOutCode: 0,
    // IDPay initiatives show in wallet
    idPay: {
      refundCount: 1,
      refundNotConfiguredCount: 0,
      refundUnsubscribedCount: 0,
      refundSuspendedCount: 0,
      discountCount: 1,
      expenseCount: 0
    }
  },
  services: {
    response: {
      getServicesPreference: 200,
      postServicesPreference: 200
    },
    national: 5,
    local: 5,
    specialServices: {
      cgn: true,
      cdc: true,
      fci: true
    },
    // it has partially effect (pr welcome)
    allowRandomValues: true
  },
  features: {
    payments: {
      numberOfTransactions: 12,
      hideReceiptResponseCode: 400
    },
    bonus: {
      cgn: {
        isCgnEligible: true,
        isEycaEligible: true,
        allowRandomValues: true,
        hangOnActivation: false
      },
      cdc: {
        enabled: true
      }
    },
    idpay: {
      ibanSize: 3
    },
    lollipop: {
      enabled: false
    },
    fastLogin: {
      sessionTTLinMS: 60000
    },
    service: {
      featuredInstitutionsSize: 5,
      featuredServicesSize: 5,
      response: {
        featuredInstitutionsResponseCode: 200,
        featuredServicesResponseCode: 200,
        institutionsResponseCode: 200,
        servicesByInstitutionIdResponseCode: 200,
        serviceByIdResponseCode: 200
      }
    },
    fims: {
      history: {
        count: 52,
        consentsEndpointFailureStatusCode: undefined,
        exportEndpointFailureStatusCode: undefined,
        exportProcessingTimeMilliseconds: 15000,
        pageSize: 12
      },
      provider: {
        federationCookieName: "_io_fims_token",
        idTokenRawPrivateKey:
          "278a5de700e29faae8e40e366ec5012b5ec63d36ec77e8a2417154cc1d25383f",
        idTokenRawPublicKey:
          "03fdd57adec3d438ea237fe46b33ee1e016eda6b585c3e27ea66686c2ea5358479",
        idTokenSigningAlgorithm: "ES256K",
        idTokenTTLMilliseconds: 15 * 60 * 1000,
        ignoreFederationCookiePresence: false,
        ignoreFederationCookieValue: true,
        implicitCodeFlow: false,
        interactionCookieKey: "_interaction",
        interactionResumeCookieKey: "_interaction_resume",
        interactionResumeSignatureCookieKey: "_interaction_resume.sig",
        interactionSignatureCookieKey: "_interaction.sig",
        interactionTTLMilliseconds: 5 * 60 * 1000,
        sessionCookieKey: "_session",
        sessionLegacyCookieKey: "_session.legacy",
        sessionLegacySignatureCookieKey: "_session.legacy.sig",
        sessionSignatureCookieKey: "_session.sig",
        sessionTTLMilliseconds: 1 * 60 * 1000,
        useLaxInsteadOfNoneForSameSiteOnSessionCookies: true
      },
      relyingParties: [
        {
          id: "1",
          isInternal: false,
          redirectUri: [`${serverUrl}/fims/relyingParty/1/redirectUri`],
          registrationName: "Example Relying Party 1",
          scopes: ["openid", "profile"]
        },
        {
          id: "2",
          isInternal: true,
          redirectUri: [`${serverUrl}/fims/relyingParty/2/redirectUri`],
          registrationName: "Example Relying Party 2",
          scopes: ["openid", "profile"]
        }
      ]
    },
    trials: {
      ["01J2GN4TA8FB6DPTAX3T3YD6M1" as TrialId]: undefined // IT-WALLET-TRIAL (the user never subscribed to the trial)
    },
    allowRandomValues: true
  }
};
/**
 * set your config file you want to load and apply
 * config file should be included in "config" directory
 */
const customConfigFile = "config.json";
const customConfig =
  readFileAsJSON(`${configFolder}/${customConfigFile}`) ?? undefined;
if (customConfig !== undefined) {
  // eslint-disable-next-line no-console
  console.log(
    chalk.bgGreenBright(
      `successfully loaded custom config file: ${customConfigFile}`
    )
  );
}

export const ioDevServerConfig: typeof defaultConfig = _.merge(
  defaultConfig,
  customConfig
);
const checkData = IoDevServerConfig.decode(ioDevServerConfig);
if (E.isLeft(checkData)) {
  throw new Error(
    `your custom config file ${customConfig} contains some invalid data:\n${readableReport(
      checkData.left
    )}`
  );
}
