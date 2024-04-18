import * as t from "io-ts";
import { GatewayFaultPaymentProblemJson } from "../../../../../definitions/pagopa/ecommerce/GatewayFaultPaymentProblemJson";
import { PartyConfigurationFaultPaymentProblemJson } from "../../../../../definitions/pagopa/ecommerce/PartyConfigurationFaultPaymentProblemJson";
import { ValidationFaultPaymentUnknownProblemJson } from "../../../../../definitions/pagopa/ecommerce/ValidationFaultPaymentUnknownProblemJson";
import { ValidationFaultPaymentDataErrorProblemJson } from "../../../../../definitions/pagopa/ecommerce/ValidationFaultPaymentDataErrorProblemJson";
import { PaymentExpiredStatusFaultPaymentProblemJson } from "../../../../../definitions/pagopa/ecommerce/PaymentExpiredStatusFaultPaymentProblemJson";
import { PaymentOngoingStatusFaultPaymentProblemJson } from "../../../../../definitions/pagopa/ecommerce/PaymentOngoingStatusFaultPaymentProblemJson";
import { PaymentCanceledStatusFaultPaymentProblemJson } from "../../../../../definitions/pagopa/ecommerce/PaymentCanceledStatusFaultPaymentProblemJson";
import { ValidationFaultPaymentUnavailableProblemJson } from "../../../../../definitions/pagopa/ecommerce/ValidationFaultPaymentUnavailableProblemJson";
import { PaymentDuplicatedStatusFaultPaymentProblemJson } from "../../../../../definitions/pagopa/ecommerce/PaymentDuplicatedStatusFaultPaymentProblemJson";

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
  PaymentDuplicatedStatusFaultPaymentProblemJson
]);
