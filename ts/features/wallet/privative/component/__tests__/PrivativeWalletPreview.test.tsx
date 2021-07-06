import { fireEvent, render } from "@testing-library/react-native";
import * as React from "react";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import { none, some } from "fp-ts/lib/Option";
import { NavigationActions } from "react-navigation";
import { mockPrivativeCard } from "../../../../../store/reducers/wallet/__mocks__/wallets";
import { PrivativePaymentMethod } from "../../../../../types/pagopa";
import PrivativeWalletPreview from "../PrivativeWalletPreview";
import * as hooks from "../../../onboarding/bancomat/screens/hooks/useImageResize";
import ROUTES from "../../../../../navigation/routes";

describe("PrivativeWalletPreview", () => {
  it("should show the caption", () => {
    jest.spyOn(hooks, "useImageResize").mockReturnValue(none);
    const { component } = getComponent(mockPrivativeCard);
    const caption = component.queryByTestId("caption");

    expect(caption).not.toBeNull();
    expect(caption).toHaveTextContent(mockPrivativeCard.caption);
  });
  it("should show the fallback gdo logo if useImageResize returns a size but there isn't the cardLogo", () => {
    jest.spyOn(hooks, "useImageResize").mockReturnValue(some([15, 15]));
    const { component } = getComponent(mockPrivativeCard);
    const cardLogo = component.queryByTestId("loyaltyLogo");
    const cardLogoFallback = component.queryByTestId("unknownLoyaltyLogo");

    expect(cardLogo).toBeNull();
    expect(cardLogoFallback).not.toBeNull();
  });
  it("should show the gdo logo if useImageResize return a size", () => {
    jest.spyOn(hooks, "useImageResize").mockReturnValue(some([15, 15]));
    const { component } = getComponent({
      ...mockPrivativeCard,
      icon: { uri: "aCardLogoUrl" }
    });
    const cardLogo = component.queryByTestId("loyaltyLogo");
    const cardLogoFallback = component.queryByTestId("unknownLoyaltyLogo");

    expect(cardLogo).not.toBeNull();
    expect(cardLogoFallback).toBeNull();
  });
  it("should call navigateToPrivativeDetailScreen when it is pressed", () => {
    jest.spyOn(hooks, "useImageResize").mockReturnValue(none);
    const { component, store } = getComponent(mockPrivativeCard);
    const cardComponent = component.queryByTestId("cardPreview");
    const expectedPayload = {
      type: NavigationActions.NAVIGATE,
      routeName: ROUTES.WALLET_PRIVATIVE_DETAIL,
      params: { privative: mockPrivativeCard }
    };
    if (cardComponent) {
      fireEvent.press(cardComponent);
      expect(store.getActions()).toEqual([expectedPayload]);
    }
  });
});
const getComponent = (privative: PrivativePaymentMethod) => {
  const mockStore = configureMockStore();
  const store = mockStore();
  return {
    component: render(
      <Provider store={store}>
        <PrivativeWalletPreview privative={privative} />
      </Provider>
    ),
    store
  };
};
