import React from "react";

/* Logos */
import LogoPaymentMaestro from "./svg/LogoPaymentMaestro";
import LogoPaymentMastercard from "./svg/LogoPaymentMastercard";
import LogoPaymentVisa from "./svg/LogoPaymentVisa";
import LogoPaymentAmex from "./svg/LogoPaymentAmex";
import LogoPaymentDiners from "./svg/LogoPaymentDiners";
import LogoPaymentDiscover from "./svg/LogoPaymentDiscover";
import LogoPaymentJCB from "./svg/LogoPaymentJCB";
import LogoPaymentUnionPay from "./svg/LogoPaymentUnionPay";
import LogoPaymentPayPal from "./svg/LogoPaymentPayPal";
import LogoPaymentBancomatPay from "./svg/LogoPaymentBancomatPay";
import LogoPaymentVPay from "./svg/LogoPaymentVPay";
import LogoPaymentPagoBancomat from "./svg/LogoPaymentPagoBancomat";
import LogoPaymentSatispay from "./svg/LogoPaymentSatispay";
import LogoPaymentPostepay from "./svg/LogoPaymentPostepay";
import LogoPaymentMyBank from "./svg/LogoPaymentMyBank";
import LogoPaymentApplePay from "./svg/LogoPaymentApplePay";

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
  pagoBancomat: LogoPaymentPagoBancomat,
  satispay: LogoPaymentSatispay,
  postepay: LogoPaymentPostepay,
  myBank: LogoPaymentMyBank,
  applePay: LogoPaymentApplePay
} as const;

export type IOLogoPaymentType = keyof typeof IOPaymentLogos;

type IOIconsProps = {
  name: IOLogoPaymentType;
  size?: number | "100%";
};

export type SVGLogoProps = {
  size: number | "100%";
};

const LogoPayment = ({ name, size = 24, ...props }: IOIconsProps) => {
  const LogoElement = IOPaymentLogos[name];
  return <LogoElement {...props} size={size} />;
};

export default LogoPayment;
