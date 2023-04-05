import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { Icon } from "../../../../components/core/icons";
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

export const getCardLogoComponent = (brand: string, size: number = 24) =>
  pipe(
    brand,
    O.of,
    O.chain(brand => {
      // Normal check for correct brand type
      if (isIOLogoPaymentType(brand)) {
        return O.some(brand);
      }
      // If fails, we check if the brand was sent UPPERCASE
      return O.fromNullable(IOPaymentLogosCaseMapping[brand]);
    }),
    O.fold(
      () => <Icon name="creditCard" size={size} />,
      brand => <LogoPayment name={brand} size={size} />
    )
  );
