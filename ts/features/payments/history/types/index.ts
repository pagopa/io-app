import { NewTransactionResponse } from "../../../../../definitions/pagopa/ecommerce/NewTransactionResponse";
import { PaymentRequestsGetResponse } from "../../../../../definitions/pagopa/ecommerce/PaymentRequestsGetResponse";
import { RptId } from "../../../../../definitions/pagopa/ecommerce/RptId";
import { PaymentStartOrigin } from "../../payment/types";
import { WalletPaymentOutcomeEnum } from "../../payment/types/PaymentOutcomeEnum";
import { WalletPaymentFailure } from "../../payment/types/WalletPaymentFailure";

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
};
