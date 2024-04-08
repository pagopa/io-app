import { NewTransactionResponse } from "../../../../../definitions/pagopa/ecommerce/NewTransactionResponse";
import { PaymentRequestsGetResponse } from "../../../../../definitions/pagopa/ecommerce/PaymentRequestsGetResponse";
import { RptId } from "../../../../../definitions/pagopa/ecommerce/RptId";
import { PaymentStartOrigin } from "../../checkout/types";
import { WalletPaymentOutcomeEnum } from "../../checkout/types/PaymentOutcomeEnum";
import { WalletPaymentFailure } from "../../checkout/types/WalletPaymentFailure";

export type PaymentHistory = {
  startOrigin?: PaymentStartOrigin;
  rptId?: RptId;
  startedAt?: Date;
  lookupId?: string;
  verifiedData?: PaymentRequestsGetResponse;
  transaction?: NewTransactionResponse;
  outcome?: WalletPaymentOutcomeEnum;
  failure?: WalletPaymentFailure;
  success?: true;
  attempt?: number;
};
