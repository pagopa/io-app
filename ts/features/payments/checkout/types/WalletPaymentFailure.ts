import * as t from "io-ts";
import { GatewayFaultPaymentProblemJson } from "../../../../../definitions/pagopa/ecommerce/GatewayFaultPaymentProblemJson";
import { PartyConfigurationFaultPaymentProblemJson } from "../../../../../definitions/pagopa/ecommerce/PartyConfigurationFaultPaymentProblemJson";
import { PaymentCanceledStatusFaultPaymentProblemJson } from "../../../../../definitions/pagopa/ecommerce/PaymentCanceledStatusFaultPaymentProblemJson";
import { PaymentDuplicatedStatusFaultPaymentProblemJson } from "../../../../../definitions/pagopa/ecommerce/PaymentDuplicatedStatusFaultPaymentProblemJson";
import { PaymentExpiredStatusFaultPaymentProblemJson } from "../../../../../definitions/pagopa/ecommerce/PaymentExpiredStatusFaultPaymentProblemJson";
import { PaymentOngoingStatusFaultPaymentProblemJson } from "../../../../../definitions/pagopa/ecommerce/PaymentOngoingStatusFaultPaymentProblemJson";
import { ValidationFaultPaymentDataErrorProblemJson } from "../../../../../definitions/pagopa/ecommerce/ValidationFaultPaymentDataErrorProblemJson";
import { ValidationFaultPaymentUnavailableProblemJson } from "../../../../../definitions/pagopa/ecommerce/ValidationFaultPaymentUnavailableProblemJson";
import { ValidationFaultPaymentUnknownProblemJson } from "../../../../../definitions/pagopa/ecommerce/ValidationFaultPaymentUnknownProblemJson";
import { PaymentGenericErrorAfterUserCancellationProblemJson } from "./PaymentGenericErrorAfterUserCancellationProblemJson";
import { PaymentVerifyGenericErrorProblemJson } from "./PaymentVerifyGenericErrorProblemJson";
import { PspPaymentMethodNotAvailableProblemJson } from "./PspPaymentMethodNotAvailableProblemJson";
import { PaymentSlowdownErrorProblemJson } from "./PaymentSlowdownErrorProblemJson";

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
