import { AuthPaymentResponseDTO } from "../../../../../definitions/idpay/AuthPaymentResponseDTO";
import { PaymentFailure } from "./failure";

export type Context = {
  trxCode?: string;
  transaction?: AuthPaymentResponseDTO;
  failure?: PaymentFailure;
};
