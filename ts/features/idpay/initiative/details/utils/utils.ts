import { IOLogoPaymentType } from "../../../../../components/core/logos";

export const operationCircuitTypeMap: Record<string, IOLogoPaymentType|undefined> = {
  "00": "pagoBancomat",
  "01": "visa",
  "02": "mastercard",
  "03": "amex",
  "04": "jcb",
  "05": "unionPay",
  "06": "diners",
  "07": "postepay",
  "08": "bancomatPay",
  "09": "satispay",
  "10": undefined
};
