import { AuthPaymentResponseDTO } from "../../../../../definitions/idpay_payment/AuthPaymentResponseDTO";
import { SyncTrxStatus } from "../../../../../definitions/idpay_payment/SyncTrxStatus";
import { PaymentFailure } from "./failure";

export type Context = {
  trxCode?: string;
  transaction?: AuthPaymentResponseDTO;
  transactionData?: SyncTrxStatus;
  failure?: PaymentFailure;
};
