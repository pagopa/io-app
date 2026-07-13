/* Logos */
import LogoPaymentAmex from "./svg/LogoPaymentAmex";
import LogoPaymentApplePay from "./svg/LogoPaymentApplePay";
import LogoPaymentBancomatPay from "./svg/LogoPaymentBancomatPay";
import LogoPaymentDiners from "./svg/LogoPaymentDiners";
import LogoPaymentDiscover from "./svg/LogoPaymentDiscover";
import LogoPaymentJCB from "./svg/LogoPaymentJCB";
import LogoPaymentMaestro from "./svg/LogoPaymentMaestro";
import LogoPaymentMastercard from "./svg/LogoPaymentMastercard";
import LogoPaymentMyBank from "./svg/LogoPaymentMyBank";
import LogoPaymentPagoBancomat from "./svg/LogoPaymentPagoBancomat";
import LogoPaymentPayPal from "./svg/LogoPaymentPayPal";
import LogoPaymentPostepay from "./svg/LogoPaymentPostepay";
import LogoPaymentSatispay from "./svg/LogoPaymentSatispay";
import LogoPaymentUnionPay from "./svg/LogoPaymentUnionPay";
import LogoPaymentVPay from "./svg/LogoPaymentVPay";
import LogoPaymentVisa from "./svg/LogoPaymentVisa";

export const IOPaymentLogos = {
  maestro: LogoPaymentMaestro,
  mastercard: LogoPaymentMastercard,
  visa: LogoPaymentVisa,
  amex: LogoPaymentAmex,
  diners: LogoPaymentDiners,
  discover: LogoPaymentDiscover,
  jcb: LogoPaymentJCB,
  unionPay: LogoPaymentUnionPay,
  payPal: LogoPaymentPayPal,
  bancomatPay: LogoPaymentBancomatPay,
  vPay: LogoPaymentVPay,
  satispay: LogoPaymentSatispay,
  postepay: LogoPaymentPostepay,
  myBank: LogoPaymentMyBank,
  pagoBancomat: LogoPaymentPagoBancomat,
  applePay: LogoPaymentApplePay
} as const;

export type IOLogoPaymentType = keyof typeof IOPaymentLogos;

type IOIconsProps = {
  name: IOLogoPaymentType;
  size?: number | "100%";
};

const LogoPayment = ({ name, size = 24, ...props }: IOIconsProps) => {
  const LogoElement = IOPaymentLogos[name];
  return <LogoElement {...props} size={size} />;
};

export default LogoPayment;
