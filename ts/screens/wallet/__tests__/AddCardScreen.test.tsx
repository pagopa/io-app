import { none, some } from "fp-ts/lib/Option";
import * as React from "react";
import { createStore } from "redux";
import { fireEvent } from "@testing-library/react-native";
import I18n from "../../../i18n";
import ROUTES from "../../../navigation/routes";
import { applicationChangeState } from "../../../store/actions/application";
import { appReducer } from "../../../store/reducers";
import { GlobalState } from "../../../store/reducers/types";
import { renderScreenFakeNavRedux } from "../../../utils/testWrapper";
import AddCardScreen, { NavigationParams } from "../AddCardScreen";
import { isValidCardHolder } from "../../../utils/input";

const mockPresentFn = jest.fn();
jest.mock("../../../utils/bottomSheet", () => ({
  __esModule: true,
  useIOBottomSheet: () => ({ present: mockPresentFn })
}));

jest.unmock("react-navigation");
jest.mock("react-native-share", () => ({
  open: jest.fn()
}));

const aValidCardHolder = "Mario Rossi";
const aValidPan = "1234 5678 9123 4568";
const aValidExpirationDate = "12/99";
const aValidSecurityCode = "123";

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

  it("should show the continue button active if all fields are correctly filled", () => {
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

    expect(isValidCardHolder(some(anInvalidCardHolder))).toBeFalsy();
    expect(errorMessage).not.toBeNull();
    expect(continueButton).toBeDisabled();
  });
});

const getComponent = () => {
  const params: NavigationParams = {
    inPayment: none
  } as NavigationParams;

  const ToBeTested: React.FunctionComponent<React.ComponentProps<
    typeof AddCardScreen
  >> = (props: React.ComponentProps<typeof AddCardScreen>) => (
    <AddCardScreen {...props} />
  );

  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, globalState as any);
  return renderScreenFakeNavRedux<GlobalState, NavigationParams>(
    ToBeTested,
    ROUTES.WALLET_ADD_CARD,
    params,
    store
  );
};
