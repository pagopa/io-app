import { CommonActions } from "@react-navigation/native";
import { fireEvent } from "@testing-library/react-native";
import { none, some } from "fp-ts/lib/Option";
import * as React from "react";
import configureMockStore from "redux-mock-store";
import I18n from "../../../../../i18n";
import NavigationService from "../../../../../navigation/NavigationService";
import ROUTES from "../../../../../navigation/routes";
import { mockPrivativeCard } from "../../../../../store/reducers/wallet/__mocks__/wallets";
import { PrivativePaymentMethod } from "../../../../../types/pagopa";
import { renderScreenFakeNavRedux } from "../../../../../utils/testWrapper";
import * as hooks from "../../../onboarding/bancomat/screens/hooks/useImageResize";
import PrivativeWalletPreview from "../PrivativeWalletPreview";

describe("PrivativeWalletPreview", () => {
  it("should show the caption", () => {
    jest.spyOn(hooks, "useImageResize").mockReturnValue(none);
    const { component } = getComponent(mockPrivativeCard);
    const caption = component.queryByTestId("caption");
    expect(caption).not.toBeNull();
    expect(caption).toHaveTextContent(mockPrivativeCard.caption);
  });
  it("should have the accessibility settings", () => {
    const { component } = getComponent(mockPrivativeCard);
    const buttonRole = component.queryByA11yRole("button");
    expect(buttonRole).not.toBeNull();

    const cardRepresentation = I18n.t("wallet.accessibility.folded.privative", {
      blurredNumber: mockPrivativeCard.info.blurredNumber
    });
    const cta = I18n.t("wallet.accessibility.folded.cta");
    const expectedLabel = `${cardRepresentation}, ${cta}`;

    const a11yLabel = component.queryByA11yLabel(expectedLabel);
    expect(a11yLabel).not.toBeNull();
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
    const spy = jest.spyOn(NavigationService, "dispatchNavigationAction");

    const { component } = getComponent(mockPrivativeCard);
    const cardComponent = component.queryByTestId("cardPreview");

    if (cardComponent) {
      fireEvent.press(cardComponent);
      expect(spy).toHaveBeenCalledWith(
        CommonActions.navigate(ROUTES.WALLET_NAVIGATOR, {
          screen: ROUTES.WALLET_PRIVATIVE_DETAIL,
          params: { privative: mockPrivativeCard }
        })
      );
    }
  });
});
const getComponent = (privative: PrivativePaymentMethod) => {
  const mockStore = configureMockStore();
  const store = mockStore();
  return {
    component: renderScreenFakeNavRedux(
      () => <PrivativeWalletPreview privative={privative} />,
      "WALLET_HOME",
      {},
      store
    ),
    store
  };
};
