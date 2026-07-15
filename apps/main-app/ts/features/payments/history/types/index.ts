import { NewTransactionResponse } from "../../../../../definitions/pagopa/ecommerce/NewTransactionResponse";
import { PaymentRequestsGetResponse } from "../../../../../definitions/pagopa/ecommerce/PaymentRequestsGetResponse";
import { RptId } from "../../../../../definitions/pagopa/ecommerce/RptId";
import { PaymentStartOrigin } from "../../checkout/types";
import { WalletPaymentOutcomeEnum } from "../../checkout/types/PaymentOutcomeEnum";
import { WalletPaymentFailure } from "../../checkout/types/WalletPaymentFailure";

export type PaymentHistory = {
  attempt?: number;
  failure?: WalletPaymentFailure;
  lookupId?: string;
  outcome?: WalletPaymentOutcomeEnum;
  rptId?: RptId;
  startedAt?: Date;
  startOrigin?: PaymentStartOrigin;
  success?: true;
  transaction?: NewTransactionResponse;
  verifiedData?: PaymentRequestsGetResponse;
};
