import * as t from "io-ts";
import { GatewayFaultPaymentProblemJson } from "../../../../../definitions/pagopa/ecommerce/GatewayFaultPaymentProblemJson";
import { PartyConfigurationFaultPaymentProblemJson } from "../../../../../definitions/pagopa/ecommerce/PartyConfigurationFaultPaymentProblemJson";
import { PartyTimeoutFaultPaymentProblemJson } from "../../../../../definitions/pagopa/ecommerce/PartyTimeoutFaultPaymentProblemJson";
import { PaymentStatusFaultPaymentProblemJson } from "../../../../../definitions/pagopa/ecommerce/PaymentStatusFaultPaymentProblemJson";
import { ValidationFaultPaymentProblemJson } from "../../../../../definitions/pagopa/ecommerce/ValidationFaultPaymentProblemJson";

export type WalletPaymentFailure = t.TypeOf<typeof WalletPaymentFailure>;
export const WalletPaymentFailure = t.union([
  ValidationFaultPaymentProblemJson,
  PaymentStatusFaultPaymentProblemJson,
  GatewayFaultPaymentProblemJson,
  PartyConfigurationFaultPaymentProblemJson,
  PartyTimeoutFaultPaymentProblemJson
]);
