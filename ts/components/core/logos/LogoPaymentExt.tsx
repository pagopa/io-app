import React from "react";
import LogoPaymentExtAmex from "./svg/LogoPaymentExtAmex";

/* Logos */
import LogoPaymentExtMaestro from "./svg/LogoPaymentExtMaestro";
import LogoPaymentExtMastercard from "./svg/LogoPaymentExtMastercard";
import LogoPaymentExtVisa from "./svg/LogoPaymentExtVisa";
import LogoPaymentExtVisaElectron from "./svg/LogoPaymentExtVisaElectron";
import LogoPaymentExtVPay from "./svg/LogoPaymentExtVPay";
import LogoPaymentExtDiners from "./svg/LogoPaymentExtDiners";
import LogoPaymentExtJCB from "./svg/LogoPaymentExtJCB";
import LogoPaymentExtUnionPay from "./svg/LogoPaymentExtUnionPay";
import LogoPaymentExtPayPal from "./svg/LogoPaymentExtPayPal";
import LogoPaymentExtBancomatPay from "./svg/LogoPaymentExtBancomatPay";
import LogoPaymentExtPostepay from "./svg/LogoPaymentExtPostepay";
import LogoPaymentExtSatispay from "./svg/LogoPaymentExtSatispay";
import LogoPaymentExtPagoBancomat from "./svg/LogoPaymentExtPagoBancomat";
import LogoPaymentExtApplePay from "./svg/LogoPaymentExtApplePay";

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
  bancomatPay: LogoPaymentExtBancomatPay,
  postepay: LogoPaymentExtPostepay,
  satispay: LogoPaymentExtSatispay,
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
