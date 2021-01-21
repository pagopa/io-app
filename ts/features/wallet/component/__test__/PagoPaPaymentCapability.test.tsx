import * as React from "react";
import { render } from "@testing-library/react-native";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import {
  BancomatPaymentMethod,
  CreditCardPaymentMethod,
  CreditCardType,
  PaymentMethod,
  SatispayPaymentMethod
} from "../../../../types/pagopa";
import PagoPaPaymentCapability from "../PagoPaPaymentCapability";

const renderTestTarget = (paymentMethod: PaymentMethod) =>
  render(
    <BottomSheetModalProvider>
      <PagoPaPaymentCapability paymentMethod={paymentMethod} />
    </BottomSheetModalProvider>
  );

describe("PagoPaPaymentCapability", () => {
  it("should render a badge with the text Active if passed a payment method of kind CreditCard and the brand is not MAESTRO", () => {
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

    const component = renderTestTarget(aPaymentMethod);

    expect(component.getByText("Active")).toBeTruthy();
  });

  it("should render a badge with the text Arriving if passed a payment method of kind CreditCard and the brand is MAESTRO", () => {
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

    const component = renderTestTarget(aPaymentMethod);

    expect(component.getByText("Arriving")).toBeTruthy();
  });

  it("should render a badge with the text Arriving if passed a payment method of kind Satispay", () => {
    const aSatispay = {} as SatispayPaymentMethod;
    const aPaymentMethod = {
      ...aSatispay,
      kind: "Satispay"
    } as PaymentMethod;

    const component = renderTestTarget(aPaymentMethod);

    expect(component.getByText("Arriving")).toBeTruthy();
  });

  it("should render a badge with the text Arriving if passed a payment method of kind BPay", () => {
    const aBPay = {} as SatispayPaymentMethod;
    const aPaymentMethod = {
      ...aBPay,
      kind: "BPay"
    } as PaymentMethod;

    const component = renderTestTarget(aPaymentMethod);

    expect(component.getByText("Arriving")).toBeTruthy();
  });

  it("should render a badge with the text Incompatible if passed a payment method of kind Bancomat", () => {
    const aBancomat = {} as BancomatPaymentMethod;
    const aPaymentMethod = {
      ...aBancomat,
      kind: "Bancomat"
    } as PaymentMethod;

    const component = renderTestTarget(aPaymentMethod);

    expect(component.getByText("Incompatible")).toBeTruthy();
  });
});
