import { fireEvent, render } from "@testing-library/react-native";
import * as React from "react";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import { none, some } from "fp-ts/lib/Option";
import { NavigationActions } from "react-navigation";
import { PrivativePaymentMethod } from "../../../../../types/pagopa";
import PrivativeWalletPreview from "../PrivativeWalletPreview";
import * as hooks from "../../../onboarding/bancomat/screens/hooks/useImageResize";
import ROUTES from "../../../../../navigation/routes";

describe("PrivativeWalletPreview", () => {
  const aPrivativeCard: PrivativePaymentMethod = {
    walletType: "Card",
    createDate: "2021-07-08",
    enableableFunctions: ["FA", "pagoPA", "BPD"],
    favourite: false,
    idWallet: 25572,
    info: {
      blurredNumber: "0001",
      brand: "Maestro",
      brandLogo:
        "https://wisp2.pagopa.gov.it/wallet/assets/img/creditcard/carta_maestro.png",
      expireMonth: "11",
      expireYear: "2021",
      hashPan:
        "d48a59cdfbe3da7e4fe25e28cbb47d5747720ecc6fc392c87f1636fe95db22f90004",
      holder: "Maria Rossi",
      htokenList: ["token1", "token2"],
      issuerAbiCode: "CONAD",
      type: "PRV"
    },
    onboardingChannel: "IO",
    pagoPA: false,
    updateDate: "2020-11-20",
    kind: "CreditCard",
    caption: "●●●●0001",
    icon: 37
  } as PrivativePaymentMethod;
  it("should show the caption", () => {
    jest.spyOn(hooks, "useImageResize").mockReturnValue(none);
    const { component } = getComponent(aPrivativeCard);
    const caption = component.queryByTestId("caption");

    expect(caption).not.toBeNull();
    expect(caption).toHaveTextContent(aPrivativeCard.caption);
  });
  it("should show the fallback gdo logo if useImageResize return a size but there isn't the cardLogo", () => {
    jest.spyOn(hooks, "useImageResize").mockReturnValue(some([15, 15]));
    const { component } = getComponent(aPrivativeCard);
    const cardLogo = component.queryByTestId("gdoLogo");
    const cardLogoFallback = component.queryByTestId("unknownGdoLogo");

    expect(cardLogo).toBeNull();
    expect(cardLogoFallback).not.toBeNull();
  });
  it("should show the gdo logo if useImageResize return a size and there is the cardLogo", () => {
    jest.spyOn(hooks, "useImageResize").mockReturnValue(some([15, 15]));
    const { component } = getComponent({
      ...aPrivativeCard,
      cardLogo: "aCardLogoUrl"
    });
    const cardLogo = component.queryByTestId("gdoLogo");
    const cardLogoFallback = component.queryByTestId("unknownGdoLogo");

    expect(cardLogo).not.toBeNull();
    expect(cardLogoFallback).toBeNull();
  });
  it("should call navigateToPrivativeDetailScreen when press on it", () => {
    jest.spyOn(hooks, "useImageResize").mockReturnValue(none);
    const { component, store } = getComponent(aPrivativeCard);
    const cardComponent = component.queryByTestId("cardPreview");
    const expectedPayload = {
      type: NavigationActions.NAVIGATE,
      routeName: ROUTES.WALLET_PRIVATIVE_DETAIL,
      params: { privative: aPrivativeCard }
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
