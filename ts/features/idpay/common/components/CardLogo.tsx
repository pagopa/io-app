import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { toUpperCase } from "fp-ts/lib/string";
import * as React from "react";
import { IOIconSizeScale, Icon } from "../../../../components/core/icons";
import {
  IOLogoPaymentType,
  IOPaymentLogos,
  LogoPayment
} from "../../../../components/core/logos";

const IOPaymentLogosCaseMapping: { [key: string]: IOLogoPaymentType } = {
  MAESTRO: "maestro",
  MASTERCARD: "mastercard",
  VISA: "visa",
  AMEX: "amex",
  DINERS: "diners",
  DISCOVER: "discover",
  JCB: "jcb",
  UNIONPAY: "unionPay",
  PAYPAL: "payPal",
  BANCOMATPAY: "bancomatPay",
  VPAY: "vPay",
  PAGOBANCOMAT: "pagoBancomat",
  SATISPAY: "satispay",
  POSTEPAY: "postepay",
  MYBANK: "myBank",
  APPLEPAY: "applePay"
} as const;

const isIOLogoPaymentType = (u: unknown): u is IOLogoPaymentType =>
  IOPaymentLogos[u as IOLogoPaymentType] !== undefined;

export const getCardLogoComponent = (
  brand: string | undefined,
  size: IOIconSizeScale = 24
) =>
  pipe(
    brand,
    O.fromNullable,
    O.map(toUpperCase),
    O.map(brand => IOPaymentLogosCaseMapping[brand]),
    O.chain(O.fromNullable),
    O.filter(isIOLogoPaymentType),
    O.fold(
      () => <Icon name="creditCard" size={size as IOIconSizeScale} />,
      brand => <LogoPayment name={brand} size={size} />
    )
  );
