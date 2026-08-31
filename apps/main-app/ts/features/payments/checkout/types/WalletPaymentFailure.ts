import { GatewayFaultPaymentProblemJson } from "@io-app/api-types/generated/definitions/pagopa/ecommerce/GatewayFaultPaymentProblemJson";
import { PartyConfigurationFaultPaymentProblemJson } from "@io-app/api-types/generated/definitions/pagopa/ecommerce/PartyConfigurationFaultPaymentProblemJson";
import { PaymentCanceledStatusFaultPaymentProblemJson } from "@io-app/api-types/generated/definitions/pagopa/ecommerce/PaymentCanceledStatusFaultPaymentProblemJson";
import { PaymentDuplicatedStatusFaultPaymentProblemJson } from "@io-app/api-types/generated/definitions/pagopa/ecommerce/PaymentDuplicatedStatusFaultPaymentProblemJson";
import { PaymentExpiredStatusFaultPaymentProblemJson } from "@io-app/api-types/generated/definitions/pagopa/ecommerce/PaymentExpiredStatusFaultPaymentProblemJson";
import { PaymentOngoingStatusFaultPaymentProblemJson } from "@io-app/api-types/generated/definitions/pagopa/ecommerce/PaymentOngoingStatusFaultPaymentProblemJson";
import { ValidationFaultPaymentDataErrorProblemJson } from "@io-app/api-types/generated/definitions/pagopa/ecommerce/ValidationFaultPaymentDataErrorProblemJson";
import { ValidationFaultPaymentUnavailableProblemJson } from "@io-app/api-types/generated/definitions/pagopa/ecommerce/ValidationFaultPaymentUnavailableProblemJson";
import { ValidationFaultPaymentUnknownProblemJson } from "@io-app/api-types/generated/definitions/pagopa/ecommerce/ValidationFaultPaymentUnknownProblemJson";
import * as t from "io-ts";

import { PaymentGenericErrorAfterUserCancellationProblemJson } from "./PaymentGenericErrorAfterUserCancellationProblemJson";
import { PaymentSlowdownErrorProblemJson } from "./PaymentSlowdownErrorProblemJson";
import { PaymentVerifyGenericErrorProblemJson } from "./PaymentVerifyGenericErrorProblemJson";
import { PspPaymentMethodNotAvailableProblemJson } from "./PspPaymentMethodNotAvailableProblemJson";

export type WalletPaymentFailure = t.TypeOf<typeof WalletPaymentFailure>;
export const WalletPaymentFailure = t.union([
  GatewayFaultPaymentProblemJson,
  PartyConfigurationFaultPaymentProblemJson,
  ValidationFaultPaymentUnknownProblemJson,
  ValidationFaultPaymentDataErrorProblemJson,
  PaymentExpiredStatusFaultPaymentProblemJson,
  PaymentOngoingStatusFaultPaymentProblemJson,
  PaymentCanceledStatusFaultPaymentProblemJson,
  ValidationFaultPaymentUnavailableProblemJson,
  PaymentDuplicatedStatusFaultPaymentProblemJson,
  PaymentGenericErrorAfterUserCancellationProblemJson,
  PaymentVerifyGenericErrorProblemJson,
  PspPaymentMethodNotAvailableProblemJson,
  PaymentSlowdownErrorProblemJson
]);
