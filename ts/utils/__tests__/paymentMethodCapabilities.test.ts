import { TypeEnum } from "../../../definitions/pagopa/walletv2/CardInfo";
import {
  BancomatPaymentMethod,
  CreditCardPaymentMethod,
  PaymentMethod,
  SatispayPaymentMethod
} from "../../types/pagopa";
import {
  isPaymentMethodSupported,
  canMethodPay
} from "../paymentMethodCapabilities";

describe("canMethodPay", () => {
  it("should return true if the Credit card is of type CrediCardType", () => {
    const aKnownCreditCard = {
      kind: "CreditCard",
      info: {
        brand: "VISA"
      },
      pagoPA: true
    } as CreditCardPaymentMethod;

    expect(canMethodPay(aKnownCreditCard)).toBeTruthy();
  });

  it("should return false if the Credit card is of type CrediCardType but pagoPA is false", () => {
    const aKnownCreditCard = {
      kind: "CreditCard",
      info: {
        brand: "VISA"
      },
      pagoPA: false
    } as CreditCardPaymentMethod;
    expect(canMethodPay(aKnownCreditCard)).toBeFalsy();
  });
  it("should return true if the Credit card is not of type CrediCardType", () => {
    const anUnKnownCreditCard = {
      kind: "CreditCard",
      info: {
        brand: "UNKNOwN"
      },
      pagoPA: true
    } as CreditCardPaymentMethod;

    expect(canMethodPay(anUnKnownCreditCard)).toBeTruthy();
  });
  it("should return true if pagoPa is true but is not of type CrediCardType", () => {
    const anNonCreditCardPaymentMethod = {
      pagoPA: true
    } as SatispayPaymentMethod;

    expect(canMethodPay(anNonCreditCardPaymentMethod)).toBeTruthy();
  });
});

describe("isPaymentMethodSupported", () => {
  it("should return available if the payment method is of kind CreditCard, pagoPa is true", () => {
    const aNonMaestroCreditCard = {
      kind: "CreditCard",
      info: {
        brand: "VISA"
      },
      pagoPA: true
    } as CreditCardPaymentMethod;
    const aPaymentMethod = {
      ...aNonMaestroCreditCard,
      kind: "CreditCard",
      pagoPA: true
    } as PaymentMethod;

    expect(isPaymentMethodSupported(aPaymentMethod)).toEqual("available");
  });
  it("should return not_available if is a credit card and pagoPa is false", () => {
    const aMaestroCreditCard = {
      kind: "CreditCard",
      info: {
        brand: "MAESTRO"
      }
    } as CreditCardPaymentMethod;
    const aPaymentMethod = {
      ...aMaestroCreditCard,
      kind: "CreditCard",
      pagoPA: false
    } as PaymentMethod;

    expect(isPaymentMethodSupported(aPaymentMethod)).toEqual("not_available");
  });
  it("should return onboardableNotImplemented if is a cobadge card", () => {
    const aCreditCard = {
      kind: "CreditCard",
      info: {
        brand: "MAESTRO",
        issuerAbiCode: "123"
      }
    } as CreditCardPaymentMethod;
    const aPaymentMethod = {
      ...aCreditCard,
      kind: "CreditCard",
      pagoPA: false
    } as PaymentMethod;

    expect(isPaymentMethodSupported(aPaymentMethod)).toEqual(
      "onboardableNotImplemented"
    );
  });

  it("should return arriving if the payment method is of kind Satispay", () => {
    const aSatispay = {} as SatispayPaymentMethod;
    const aPaymentMethod = {
      ...aSatispay,
      kind: "Satispay"
    } as PaymentMethod;

    expect(isPaymentMethodSupported(aPaymentMethod)).toEqual("arriving");
  });
  it("should return arriving if the payment method is of kind BPay", () => {
    const aBPay = {} as SatispayPaymentMethod;
    const aPaymentMethod = {
      ...aBPay,
      kind: "BPay"
    } as PaymentMethod;

    expect(isPaymentMethodSupported(aPaymentMethod)).toEqual("arriving");
  });

  it("should return not_available if the payment method is of kind Bancomat", () => {
    const aBancomat = {} as BancomatPaymentMethod;
    const aPaymentMethod = {
      ...aBancomat,
      kind: "Bancomat"
    } as PaymentMethod;

    expect(isPaymentMethodSupported(aPaymentMethod)).toEqual("not_available");
  });

  it("should return not_available if is a privative card", () => {
    const aCreditCard = {
      kind: "CreditCard",
      info: {
        brand: "MAESTRO",
        issuerAbiCode: "123",
        type: TypeEnum.PRV
      }
    } as CreditCardPaymentMethod;
    const aPaymentMethod = {
      ...aCreditCard,
      kind: "CreditCard",
      pagoPA: false
    } as PaymentMethod;

    expect(isPaymentMethodSupported(aPaymentMethod)).toEqual("not_available");
  });
});
