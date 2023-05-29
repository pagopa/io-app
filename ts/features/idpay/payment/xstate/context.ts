import { AuthPaymentResponseDTO } from "../../../../../definitions/idpay_payment/AuthPaymentResponseDTO";
import { PaymentFailure } from "./failure";

export type Context = {
  transactionId?: string;
  trxCode?: string;
  transaction?: AuthPaymentResponseDTO;
  failure?: PaymentFailure;
};
