import { PaymentFaultV2Enum } from "@io-app/api-types/generated/definitions/communication/PaymentFaultV2";
import { EmailAddress } from "@io-app/api-types/generated/definitions/identity/EmailAddress";
import { PreferredLanguages } from "@io-app/api-types/generated/definitions/identity/PreferredLanguages";
import { PushNotificationsContentType } from "@io-app/api-types/generated/definitions/identity/PushNotificationsContentType";
import { ReminderStatus } from "@io-app/api-types/generated/definitions/identity/ReminderStatus";
import { AmountEuroCents as ImportoEuroCents } from "@io-app/api-types/generated/definitions/pagopa/ecommerce/AmountEuroCents";
import { SubscriptionState } from "@io-app/api-types/generated/definitions/trial_system/SubscriptionState";
import { TrialId } from "@io-app/api-types/generated/definitions/trial_system/TrialId";
import {
  NonNegativeNumber,
  WithinRangeInteger,
  WithinRangeNumber
} from "@pagopa/ts-commons/lib/numbers";
import { FiscalCode, NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { enumType } from "@pagopa/ts-commons/lib/types";
import * as t from "io-ts";

import { FIMSConfig } from "../features/fims/types/config";
import { MessagesConfig } from "../features/messages/types/messagesConfig";
import { WalletConfiguration } from "../features/payments/types/configuration";
import { SendConfig } from "../features/pn/types/sendConfig";
import { ServiceConfiguration } from "../features/services/types/configuration";
import { AllowRandomValue } from "./allowRandomValue";
import { HttpResponseCode } from "./httpResponseCode";

/* profile */
export const ProfileAttrs = t.intersection([
  t.interface({
    fiscal_code: FiscalCode,
    name: t.string,
    family_name: t.string,
    mobile: NonEmptyString,
    accepted_tos_version: NonNegativeNumber,
    preferred_languages: PreferredLanguages
  }),
  t.partial({
    email: EmailAddress,
    reminder_status: ReminderStatus,
    is_email_validated: t.boolean,
    is_email_already_taken: t.boolean,
    push_notifications_content_type: PushNotificationsContentType
  })
]);

export type ProfileAttrs = t.TypeOf<typeof ProfileAttrs>;

/* wallet */
export const WalletMethodConfig = t.interface({
  // bancomats enrolled
  walletBancomatCount: t.number,
  // creditcards enrolled
  walletCreditCardCount: t.number,
  // creditcards-cobadge enrolled
  walletCreditCardCoBadgeCount: t.number,
  // privative enrolled
  privativeCount: t.number,
  // satispay enrolled
  satispayCount: t.number,
  // paypal enrolled
  paypalCount: t.number,
  // bancomat pay enrolled
  bPayCount: t.number,
  // bancomat owned by the citizen (shown when he/she search about them)
  citizenBancomatCount: t.number,
  // bancomat pay owned by the citizen (shown when he/she search about them)
  citizenBPayCount: t.number,
  // creditcards-cobadge pay owned by the citizen (shown when he/she search about them)
  citizenCreditCardCoBadgeCount: t.number,
  // if true -> citizen has satispay (when he/she search about it)
  citizenSatispay: t.boolean,
  // if true -> citizen has privative cards (when he/she search about it)
  citizenPrivative: t.boolean,
  // if true -> citizen has paypal (when he/she search about it)
  citizenPaypal: t.boolean
});
export type WalletMethodConfig = t.TypeOf<typeof WalletMethodConfig>;

const PaymentConfig = t.interface({
  // integer including decimals - ie: 22.22 = 2222
  amount: ImportoEuroCents,
  pspFeeAmount: t.number
});
type PaymentConfig = t.TypeOf<typeof PaymentConfig>;

const ErrorCodes = WithinRangeInteger(400, 600);
type ErrorCodes = t.TypeOf<typeof ErrorCodes>;
const responseError = t.interface({
  // the probability that server will response with an error
  chance: WithinRangeNumber(0, 1),
  // a bucket of error codes. If the server will response with an error, a random one will be picked
  codes: t.readonlyArray(ErrorCodes)
});

const SpecialServicesConfig = t.interface({
  cgn: t.boolean,
  cdc: t.boolean,
  fci: t.boolean
});

const ServicesConfig = t.intersection([
  t.interface({
    // configure some API response error code
    response: t.interface({
      // 200 success
      postServicesPreference: HttpResponseCode,
      // 200 success with payload
      getServicesPreference: HttpResponseCode
    }),
    // number of services national
    national: t.number,
    // number of services local
    local: t.number,
    // special services on/off
    specialServices: SpecialServicesConfig
  }),
  AllowRandomValue
]);

export const IoDevServerConfig = t.interface({
  global: t.intersection([
    t.interface({
      // the global delay applied to all responses (0 means instant response)
      delay: t.number,
      // if true, no login page will be shown (SPID)
      autoLogin: t.boolean,
      // if false fixed values will be used
      allowRandomValues: t.boolean,
      // if true, logs the lollipop parameters generated during a login request
      logSAMLRequest: t.boolean,
      // if true, sends the session token also as query param
      sendSessionTokenAsQueryParam: t.boolean
    }),
    AllowRandomValue,
    t.partial({
      // the server will response with an error code on every request
      // with a change and code as defined
      responseError
    })
  ]),
  // some attributes of the profile used as citizen
  profile: t.intersection([
    t.interface({
      attrs: ProfileAttrs,
      authenticationProvider: t.keyof({
        cie: null,
        spid: null
      }),
      firstOnboarding: t.boolean
    }),
    AllowRandomValue
  ]),
  messages: MessagesConfig,
  send: SendConfig,
  services: ServicesConfig,
  wallet: t.intersection([
    t.interface({
      // if false fixed values will be used
      allowRandomValues: t.boolean,
      methods: WalletMethodConfig,
      shuffleAbi: t.boolean,
      // IDPay initiatives in wallet
      idPay: t.interface({
        refundCount: t.number,
        refundNotConfiguredCount: t.number,
        refundSuspendedCount: t.number,
        refundUnsubscribedCount: t.number,
        discountCount: t.number,
        expenseCount: t.number
      })
    }),
    t.partial({
      // the outcode returned at the end of credit card onboarding
      onboardingCreditCardOutCode: t.number,
      // the outcode returned at the end of paypal onboarding
      onboardingPaypalOutCode: t.number,
      // the outcode returned at the end of a payment
      paymentOutCode: t.number,
      // if defined attiva will serve the given error
      attivaError: enumType<PaymentFaultV2Enum>(
        PaymentFaultV2Enum,
        "detail_v2"
      ),
      // if verifica attiva will serve the given error
      verificaError: enumType<PaymentFaultV2Enum>(
        PaymentFaultV2Enum,
        "detail_v2"
      ),
      // configure the dummy payment
      payment: PaymentConfig
    }),

    AllowRandomValue
  ]),
  features: t.intersection([
    t.interface({
      payments: t.interface({
        // the number of transactions to generate at the beginning
        numberOfTransactions: t.number,
        // the response code when hiding a receipt
        hideReceiptResponseCode: HttpResponseCode
      }),
      bonus: t.interface({
        // defines the special configuration for cgn eligibility
        cgn: t.intersection([
          t.interface({
            // if true the user is eligible to the CGN
            isCgnEligible: t.boolean,
            // if true the user is eligible to the EYCA related activation
            isEycaEligible: t.boolean,
            // if true the handler does nothing, effectively timing out, use to test loading states
            hangOnActivation: t.boolean
          }),
          AllowRandomValue
        ]),
        cdc: t.interface({
          // if true the user is eligible to see the CdC from the wallet section
          enabled: t.boolean
        })
      }),
      idpay: t.interface({
        // The size of the IBAN list to generate
        ibanSize: t.number
      }),
      lollipop: t.intersection([
        t.interface({
          enabled: t.boolean
        }),
        t.partial({
          assertionRefValidityMS: t.number
        })
      ]),
      service: ServiceConfiguration,
      fims: FIMSConfig
    }),
    t.partial({
      wallet: WalletConfiguration
    }),
    t.partial({
      fastLogin: t.interface({
        sessionTTLinMS: t.number
      })
    }),
    t.partial({
      trials: t.record(TrialId, t.union([SubscriptionState, t.undefined]))
    }),
    AllowRandomValue
  ])
});
export type AllorRandomValueKeys = keyof IoDevServerConfig;
export type IoDevServerConfig = t.TypeOf<typeof IoDevServerConfig>;
type SpecialServicesConfig = t.TypeOf<typeof SpecialServicesConfig>;
