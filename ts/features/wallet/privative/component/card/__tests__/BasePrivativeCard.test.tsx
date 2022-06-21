import { render } from "@testing-library/react-native";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import { ImageSourcePropType, ImageURISource } from "react-native";
import { Provider } from "react-redux";
import { Store } from "redux";
import configureMockStore from "redux-mock-store";
import * as hooks from "../../../../onboarding/bancomat/screens/hooks/useImageResize";
import BasePrivativeCard from "../BasePrivativeCard";

jest.mock("../../../../onboarding/bancomat/screens/hooks/useImageResize");

const aCaption = "****1234";
const aLoyaltyLogo = {
  uri: "http://127.0.0.1:3000/static_contents/logos/privative/loyalty/CONAD.png"
};

const aGdoLogo = {
  uri: "http://127.0.0.1:3000/static_contents/logos/privative/gdo/CONAD.png"
};
describe("PrivativeWalletPreview component", () => {
  const mockStore = configureMockStore();
  // eslint-disable-next-line functional/no-let
  let store: ReturnType<typeof mockStore>;

  beforeEach(() => {
    store = mockStore();
  });
  it("should show the loyaltyLogo if is of type ImageURISource and if useImageResize return some value", () => {
    jest.spyOn(hooks, "useImageResize").mockReturnValue(O.some([15, 15]));
    const component = getComponent(store, aLoyaltyLogo);
    const loyaltyLogoComponent = component.queryByTestId("loyaltyLogo");

    expect(loyaltyLogoComponent).not.toBeNull();
    expect(loyaltyLogoComponent).toHaveProp("source", aLoyaltyLogo);
  });
  it("should show the fallback loyaltyLogo if the loyaltyLogo prop is not of type ImageURISource", () => {
    jest.spyOn(hooks, "useImageResize").mockReturnValue(O.some([15, 15]));
    const notAnImageURISourceLogo = 3;
    const component = getComponent(store, notAnImageURISourceLogo);
    const unknownLoyaltyLogo = component.queryByTestId("unknownLoyaltyLogo");

    expect(unknownLoyaltyLogo).not.toBeNull();
    expect(unknownLoyaltyLogo).toHaveProp("source", {
      testUri: "../../../img/wallet/unknown-gdo.png"
    });
  });

  it("should show the fallback loyaltyLogo if useImageResize return none", () => {
    jest.spyOn(hooks, "useImageResize").mockReturnValue(O.none);
    const component = getComponent(store, aLoyaltyLogo);
    const unknownLoyaltyLogo = component.queryByTestId("unknownLoyaltyLogo");

    expect(unknownLoyaltyLogo).not.toBeNull();
    expect(unknownLoyaltyLogo).toHaveProp("source", {
      testUri: "../../../img/wallet/unknown-gdo.png"
    });
  });

  it("should show the caption if is defined", () => {
    jest.spyOn(hooks, "useImageResize").mockReturnValue(O.none);
    const component = getComponent(store, aLoyaltyLogo, aCaption);
    const caption = component.queryByTestId("caption");

    expect(caption).not.toBeNull();
    expect(caption).toHaveTextContent(aCaption);
  });

  it("should show the gdoLogo if there is a gdoLogo and useImageResize return some value", () => {
    jest.spyOn(hooks, "useImageResize").mockReturnValue(O.some([15, 15]));
    const component = getComponent(store, aLoyaltyLogo, aCaption, aGdoLogo);
    const loyaltyLogo = component.queryByTestId("gdoLogo");

    expect(loyaltyLogo).not.toBeNull();
    expect(loyaltyLogo).toHaveProp("source", aGdoLogo);
  });

  it("should show the blocked badge if is blocked prop is true", () => {
    jest.spyOn(hooks, "useImageResize").mockReturnValue(O.none);
    const component = getComponent(
      store,
      aLoyaltyLogo,
      aCaption,
      undefined,
      true
    );
    const blockedBadge = component.queryByTestId("blockedBadge");

    expect(blockedBadge).not.toBeNull();
  });
});

const getComponent = (
  store: Store<unknown>,
  loyaltyLogo: ImageSourcePropType,
  caption?: string,
  gdoLogo?: ImageURISource,
  blocked?: boolean
) =>
  render(
    <Provider store={store}>
      <BasePrivativeCard
        loyaltyLogo={loyaltyLogo}
        caption={caption}
        gdoLogo={gdoLogo}
        blocked={blocked}
      />
    </Provider>
  );
