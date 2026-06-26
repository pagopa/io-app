/* Logos */
import LogoPaymentExtAmex from "./svg/LogoPaymentExtAmex";
import LogoPaymentExtApplePay from "./svg/LogoPaymentExtApplePay";
import LogoPaymentExtBancomatPay from "./svg/LogoPaymentExtBancomatPay";
import LogoPaymentExtDiners from "./svg/LogoPaymentExtDiners";
import LogoPaymentExtJCB from "./svg/LogoPaymentExtJCB";
import LogoPaymentExtMaestro from "./svg/LogoPaymentExtMaestro";
import LogoPaymentExtMastercard from "./svg/LogoPaymentExtMastercard";
import LogoPaymentExtPagoBancomat from "./svg/LogoPaymentExtPagoBancomat";
import LogoPaymentExtPayPal from "./svg/LogoPaymentExtPayPal";
import LogoPaymentExtPostepay from "./svg/LogoPaymentExtPostepay";
import LogoPaymentExtSatispay from "./svg/LogoPaymentExtSatispay";
import LogoPaymentExtUnionPay from "./svg/LogoPaymentExtUnionPay";
import LogoPaymentExtVPay from "./svg/LogoPaymentExtVPay";
import LogoPaymentExtVisa from "./svg/LogoPaymentExtVisa";
import LogoPaymentExtVisaElectron from "./svg/LogoPaymentExtVisaElectron";

export const IOPaymentExtLogos = {
  maestro: LogoPaymentExtMaestro,
  mastercard: LogoPaymentExtMastercard,
  visa: LogoPaymentExtVisa,
  visaElectron: LogoPaymentExtVisaElectron,
  vPay: LogoPaymentExtVPay,
  amex: LogoPaymentExtAmex,
  diners: LogoPaymentExtDiners,
  jcb: LogoPaymentExtJCB,
  unionPay: LogoPaymentExtUnionPay,
  payPal: LogoPaymentExtPayPal,
  satispay: LogoPaymentExtSatispay,
  bancomatPay: LogoPaymentExtBancomatPay,
  postepay: LogoPaymentExtPostepay,
  pagoBancomat: LogoPaymentExtPagoBancomat,
  applePay: LogoPaymentExtApplePay
} as const;

export type IOLogoPaymentExtType = keyof typeof IOPaymentExtLogos;

type IOPaymentLogos = {
  name: IOLogoPaymentExtType;
  size?: number | "100%";
};

const LogoPaymentExt = ({ name, size = 24, ...props }: IOPaymentLogos) => {
  const LogoElement = IOPaymentExtLogos[name];
  return <LogoElement {...props} size={size} />;
};

export default LogoPaymentExt;
