import { NewTransactionResponse } from "../../../../../definitions/pagopa/ecommerce/NewTransactionResponse";
import { PaymentRequestsGetResponse } from "../../../../../definitions/pagopa/ecommerce/PaymentRequestsGetResponse";
import { RptId } from "../../../../../definitions/pagopa/ecommerce/RptId";
import { WalletInfo } from "../../../../../definitions/pagopa/walletv3/WalletInfo";
import { WalletInfo as EcommerceWalletInfo } from "../../../../../definitions/pagopa/ecommerce/WalletInfo";
import { PaymentStartOrigin } from "../../checkout/types";
import { WalletPaymentOutcomeEnum } from "../../checkout/types/PaymentOutcomeEnum";
import { WalletPaymentFailure } from "../../checkout/types/WalletPaymentFailure";

export type PaymentHistory = {
  startOrigin?: PaymentStartOrigin;
  rptId?: RptId;
  startedAt?: Date;
  lookupId?: string;
  savedPaymentMethods?: ReadonlyArray<WalletInfo | EcommerceWalletInfo>;
  savedPaymentMethodsUnavailable?: ReadonlyArray<WalletInfo>;
  selectedPaymentMethod?: string;
  verifiedData?: PaymentRequestsGetResponse;
  transaction?: NewTransactionResponse;
  outcome?: WalletPaymentOutcomeEnum;
  failure?: WalletPaymentFailure;
  success?: true;
  attempt?: number;
  serviceName?: string;
};
