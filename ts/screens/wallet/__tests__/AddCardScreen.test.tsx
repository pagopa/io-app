import { fireEvent } from "@testing-library/react-native";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import { createStore } from "redux";
import { IPaymentMethod } from "../../../components/wallet/PaymentMethodsList";
import I18n from "../../../i18n";
import ROUTES from "../../../navigation/routes";
import { applicationChangeState } from "../../../store/actions/application";
import { appReducer } from "../../../store/reducers";
import { GlobalState } from "../../../store/reducers/types";
import { isValidCardHolder } from "../../../utils/input";
import { renderScreenWithNavigationStoreContext } from "../../../utils/testWrapper";
import AddCardScreen, { AddCardScreenNavigationParams } from "../AddCardScreen";
import { testableFunctions } from "../AddPaymentMethodScreen";

jest.mock("react-native-share", () => ({
  open: jest.fn()
}));

const aValidCardHolder = "Mario Rossi";
const aValidPan = "4916916025914971";
const aValidAmexPan = "374623599297410";
const aValidExpirationDate = "12/99";
const aValidSecurityCode = "123";
const aValidAmexSecurityCode = "1234";

const anInvalidCardHolder = "Màriò Ròssì";
describe("AddCardScreen", () => {
  beforeEach(() => jest.useFakeTimers());
  it("should show the continue button disabled if there aren't data", () => {
    const component = getComponent();
    const continueButton = component.queryByText(
      I18n.t("global.buttons.continue")
    );
    expect(continueButton).not.toBeNull();
    expect(continueButton).toBeDisabled();
  });

  it("should show the continue button active if all fields are correctly filled with non amex card", () => {
    const component = getComponent();
    const cardHolderInput = component.queryByTestId("cardHolderInput");
    const panInputMask = component.queryByTestId("panInputMask");
    const expirationDateInput = component.queryByTestId(
      "expirationDateInputMask"
    );
    const securityCodeInput = component.queryByTestId("securityCodeInputMask");
    const continueButton = component.queryByText(
      I18n.t("global.buttons.continue")
    );

    expect(cardHolderInput).not.toBeNull();
    expect(panInputMask).not.toBeNull();
    expect(expirationDateInput).not.toBeNull();
    expect(securityCodeInput).not.toBeNull();

    if (
      cardHolderInput &&
      panInputMask &&
      expirationDateInput &&
      securityCodeInput
    ) {
      fireEvent.changeText(panInputMask, aValidPan);
      fireEvent.changeText(expirationDateInput, aValidExpirationDate);
      fireEvent.changeText(securityCodeInput, aValidSecurityCode);
      fireEvent.changeText(cardHolderInput, aValidCardHolder);
    }

    expect(continueButton).not.toBeDisabled();
  });

  it("should show the continue button active if all fields are correctly filled with amex card", () => {
    const component = getComponent();
    const cardHolderInput = component.queryByTestId("cardHolderInput");
    const panInputMask = component.queryByTestId("panInputMask");
    const expirationDateInput = component.queryByTestId(
      "expirationDateInputMask"
    );
    const securityCodeInput = component.queryByTestId("securityCodeInputMask");
    const continueButton = component.queryByText(
      I18n.t("global.buttons.continue")
    );

    expect(cardHolderInput).not.toBeNull();
    expect(panInputMask).not.toBeNull();
    expect(expirationDateInput).not.toBeNull();
    expect(securityCodeInput).not.toBeNull();

    if (
      cardHolderInput &&
      panInputMask &&
      expirationDateInput &&
      securityCodeInput
    ) {
      fireEvent.changeText(panInputMask, aValidAmexPan);
      fireEvent.changeText(expirationDateInput, aValidExpirationDate);
      fireEvent.changeText(securityCodeInput, aValidAmexSecurityCode);
      fireEvent.changeText(cardHolderInput, aValidCardHolder);
    }

    expect(continueButton).not.toBeDisabled();
  });

  it("should show the continue button disabled if the cardHolder is invalid", () => {
    const component = getComponent();
    const cardHolderInput = component.queryByTestId("cardHolderInput");
    const panInputMask = component.queryByTestId("panInputMask");
    const expirationDateInput = component.queryByTestId(
      "expirationDateInputMask"
    );
    const securityCodeInput = component.queryByTestId("securityCodeInputMask");
    const continueButton = component.queryByText(
      I18n.t("global.buttons.continue")
    );

    if (
      cardHolderInput &&
      panInputMask &&
      expirationDateInput &&
      securityCodeInput
    ) {
      fireEvent.changeText(panInputMask, aValidPan);
      fireEvent.changeText(expirationDateInput, aValidExpirationDate);
      fireEvent.changeText(securityCodeInput, aValidSecurityCode);
      fireEvent.changeText(cardHolderInput, anInvalidCardHolder);
    }

    const errorMessage = component.queryByText(
      I18n.t("wallet.dummyCard.labels.holder.description.error")
    );

    expect(isValidCardHolder(O.some(anInvalidCardHolder))).toBeFalsy();
    expect(errorMessage).not.toBeNull();
    expect(continueButton).toBeDisabled();
  });
});

describe("getPaymentMethods", () => {
  beforeEach(() => jest.useFakeTimers());
  const props = {
    navigateBack: jest.fn(),
    startBPayOnboarding: jest.fn(),
    startSatispayOnboarding: jest.fn(),
    startPaypalOnboarding: jest.fn(),
    startAddBancomat: jest.fn(),
    navigateToAddCreditCard: jest.fn(),
    isPaypalAlreadyAdded: true,
    isPaypalEnabled: true,
    canOnboardBPay: false,
    canPayWithBPay: false
  };
  // TODO: ⚠️ cast to any only to complete the merge, should be removed!
  const methods = testableFunctions.getPaymentMethods!(props as any, {
    onlyPaymentMethodCanPay: true,
    isPaymentOnGoing: true,
    isPaypalEnabled: true,
    canOnboardBPay: true
  });

  const getMethodStatus = (
    methods: ReadonlyArray<IPaymentMethod>,
    name: string
  ): IPaymentMethod["status"] => methods.find(m => m.name === name)!.status;

  it("credit card should be always implemented", () => {
    expect(
      getMethodStatus(methods, I18n.t("wallet.methods.card.name"))
    ).toEqual("implemented");
  });

  it("paypal should be always implemented when the FF is ON", () => {
    expect(
      getMethodStatus(methods, I18n.t("wallet.methods.paypal.name"))
    ).toEqual("implemented");
  });

  it("paypal should be always notImplemented when the FF is OFF", () => {
    // TODO: ⚠️ cast to any only to complete the merge, should be removed!
    const methods = testableFunctions.getPaymentMethods!(props as any, {
      onlyPaymentMethodCanPay: true,
      isPaymentOnGoing: true,
      isPaypalEnabled: false,
      canOnboardBPay: true
    });
    expect(
      getMethodStatus(methods, I18n.t("wallet.methods.paypal.name"))
    ).toEqual("notImplemented");
  });

  it("satispay should be always notImplemented", () => {
    expect(
      getMethodStatus(methods, I18n.t("wallet.methods.satispay.name"))
    ).toEqual("notImplemented");
  });

  it("bpay should be always notImplemented if Bpay onboarding FF is OFF", () => {
    // TODO: ⚠️ cast to any only to complete the merge, should be removed!
    const methods = testableFunctions.getPaymentMethods!(props as any, {
      onlyPaymentMethodCanPay: true,
      isPaymentOnGoing: true,
      isPaypalEnabled: true,
      canOnboardBPay: false
    });
    expect(
      getMethodStatus(methods, I18n.t("wallet.methods.bancomatPay.name"))
    ).toEqual("notImplemented");
  });

  it("bpay should be always implemented if Bpay onboarding FF is ON and onlyPaymentMethodCanPay flag is OFF", () => {
    // TODO: ⚠️ cast to any only to complete the merge, should be removed!
    const methods = testableFunctions.getPaymentMethods!(props as any, {
      onlyPaymentMethodCanPay: false,
      isPaymentOnGoing: true,
      isPaypalEnabled: true,
      canOnboardBPay: true
    });
    expect(
      getMethodStatus(methods, I18n.t("wallet.methods.bancomatPay.name"))
    ).toEqual("implemented");
  });

  it("bpay should be notImplemented while a payment if it can be onboarded but it cannot pay", () => {
    const canPayWithBPay = false;
    const canOnboardBPay = true;
    // TODO: ⚠️ cast to any only to complete the merge, should be removed!
    const methods = testableFunctions.getPaymentMethods!(
      { ...props, canPayWithBPay } as any,
      {
        onlyPaymentMethodCanPay: true,
        isPaymentOnGoing: true,
        isPaypalEnabled: true,
        canOnboardBPay: canPayWithBPay && canOnboardBPay
      }
    );
    expect(
      getMethodStatus(methods, I18n.t("wallet.methods.bancomatPay.name"))
    ).toEqual("notImplemented");
  });

  it("bpay should be implemented outside a payment if it can be onboarded but it cannot pay", () => {
    const canPayWithBPay = true;
    const canOnboardBPay = true;
    const methods = testableFunctions.getPaymentMethods!(
      // TODO: ⚠️ cast to any only to complete the merge, should be removed!
      { ...props, canPayWithBPay } as any,
      {
        onlyPaymentMethodCanPay: true,
        isPaymentOnGoing: false,
        isPaypalEnabled: true,
        canOnboardBPay: canPayWithBPay && canOnboardBPay
      }
    );
    expect(
      getMethodStatus(methods, I18n.t("wallet.methods.bancomatPay.name"))
    ).toEqual("implemented");
  });
});

const getComponent = () => {
  type NavigationParams = AddCardScreenNavigationParams;
  const params: NavigationParams = {
    inPayment: O.none
  } as NavigationParams;

  const ToBeTested: React.FunctionComponent<
    React.ComponentProps<typeof AddCardScreen>
  > = (props: React.ComponentProps<typeof AddCardScreen>) => (
    <AddCardScreen {...props} />
  );

  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, globalState as any);
  return renderScreenWithNavigationStoreContext<GlobalState>(
    ToBeTested,
    ROUTES.WALLET_ADD_CARD,
    params,
    store
  );
};
