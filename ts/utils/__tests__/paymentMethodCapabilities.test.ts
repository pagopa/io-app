import {
  BancomatPaymentMethod,
  CreditCardPaymentMethod,
  CreditCardType,
  PaymentMethod,
  SatispayPaymentMethod
} from "../../types/pagopa";
import {
  extractBadgeType,
  isSupportedBrand
} from "../paymentMethodCapabilities";

describe("isSupportedBrand", () => {
  it("should return true if the Credit card is of type CrediCardType and the brand is different from MAESTRO", () => {
    const aKnownCreditCard = {
      info: {
        brand: CreditCardType.decode("VISA").value
      }
    } as CreditCardPaymentMethod;

    expect(isSupportedBrand(aKnownCreditCard)).toBeTruthy();
  });
  it("should return false if the Credit card is of type CrediCardType and the brand is MAESTRO", () => {
    const aMaestroCreditCard = {
      info: {
        brand: CreditCardType.decode("MAESTRO").value
      }
    } as CreditCardPaymentMethod;

    expect(isSupportedBrand(aMaestroCreditCard)).toBeFalsy();
  });
  it("should return true if the Credit card is not of type CrediCardType", () => {
    const anUnKnownCreditCard = {
      info: {
        brand: CreditCardType.decode("UNKNOwN").value
      }
    } as CreditCardPaymentMethod;

    expect(isSupportedBrand(anUnKnownCreditCard)).toBeTruthy();
  });
});

describe("extractBadgeType", () => {
  it("should return available if the payment method is of kind CreditCard, pagoPa is true and the brand is not MAESTRO", () => {
    const aNonMaestroCreditCard = {
      info: {
        brand: CreditCardType.decode("VISA").value
      }
    } as CreditCardPaymentMethod;
    const aPaymentMethod = {
      ...aNonMaestroCreditCard,
      kind: "CreditCard",
      pagoPA: true
    } as PaymentMethod;

    expect(extractBadgeType(aPaymentMethod)).toEqual("available");
  });
  it("should return arriving if the payment method is of kind CreditCard, pagoPa is true and the brand is MAESTRO", () => {
    const aMaestroCreditCard = {
      info: {
        brand: CreditCardType.decode("MAESTRO").value
      }
    } as CreditCardPaymentMethod;
    const aPaymentMethod = {
      ...aMaestroCreditCard,
      kind: "CreditCard",
      pagoPA: true
    } as PaymentMethod;

    expect(extractBadgeType(aPaymentMethod)).toEqual("arriving");
  });
  it("should return not_available if pagoPa is false", () => {
    const aMaestroCreditCard = {
      info: {
        brand: CreditCardType.decode("MAESTRO").value
      }
    } as CreditCardPaymentMethod;
    const aPaymentMethod = {
      ...aMaestroCreditCard,
      kind: "CreditCard",
      pagoPA: false
    } as PaymentMethod;

    expect(extractBadgeType(aPaymentMethod)).toEqual("not_available");
  });

  it("should return arriving if the payment method is of kind Satispay", () => {
    const aSatispay = {} as SatispayPaymentMethod;
    const aPaymentMethod = {
      ...aSatispay,
      kind: "Satispay"
    } as PaymentMethod;

    expect(extractBadgeType(aPaymentMethod)).toEqual("arriving");
  });

  it("should return not_available if the payment method is of kind Bancomat", () => {
    const aBancomat = {} as BancomatPaymentMethod;
    const aPaymentMethod = {
      ...aBancomat,
      kind: "Bancomat"
    } as PaymentMethod;

    expect(extractBadgeType(aPaymentMethod)).toEqual("not_available");
  });
});
