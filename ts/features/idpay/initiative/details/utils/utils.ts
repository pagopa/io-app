import { IOLogoPaymentType } from "../../../../../components/core/logos";

export type InstrumentBrandEnum =
  | "VISA"
  | "MASTERCARD"
  | "MAESTRO"
  | "Satispay"
  | "BPay";

export const instrumentBrandMap: Record<
  InstrumentBrandEnum,
  IOLogoPaymentType | undefined
> = {
  VISA: "visa",
  MASTERCARD: "mastercard",
  MAESTRO: "maestro",
  Satispay: "satispay",
  BPay: "bancomatPay"
};
