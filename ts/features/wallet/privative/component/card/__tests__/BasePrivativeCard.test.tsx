import { render } from "@testing-library/react-native";
import * as React from "react";
import { ImageSourcePropType } from "react-native";
import { Store } from "redux";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import { none, some } from "fp-ts/lib/Option";
import * as hooks from "../../../../onboarding/bancomat/screens/hooks/useImageResize";
import unknownGdo from "../../../../../../../img/wallet/unknown-gdo.png";
import BasePrivativeCard from "../BasePrivativeCard";

jest.mock("../../../../onboarding/bancomat/screens/hooks/useImageResize");

const aCaption = "****1234";
const anLoyaltyLogo =
  "http://127.0.0.1:3000/static_contents/logos/privative/loyalty/CONAD.png";
const icon = unknownGdo;
describe("CoBadgeWalletPreview component", () => {
  const mockStore = configureMockStore();
  // eslint-disable-next-line functional/no-let
  let store: ReturnType<typeof mockStore>;

  beforeEach(() => {
    store = mockStore();
  });
  it("should show the icon", () => {
    jest.spyOn(hooks, "useImageResize").mockReturnValue(none);
    const component = getComponent(store, icon);
    const gdoLogoComponent = component.queryByTestId("gdoLogo");

    expect(gdoLogoComponent).not.toBeNull();
    expect(gdoLogoComponent).toHaveProp("source", {
      testUri: "../../../img/wallet/unknown-gdo.png"
    });
  });
  it("should show the fallback loyaltyLogo if there isn't a cardLogo", () => {
    jest.spyOn(hooks, "useImageResize").mockReturnValue(none);
    const component = getComponent(store, icon);
    const gdoLogoComponent = component.queryByTestId("fallbackLoyaltyLogo");

    expect(gdoLogoComponent).not.toBeNull();
    expect(gdoLogoComponent).toHaveProp("source", {
      testUri: "../../../img/wallet/unknown-gdo.png"
    });
  });

  it("should show the caption if is defined", () => {
    jest.spyOn(hooks, "useImageResize").mockReturnValue(none);
    const component = getComponent(store, icon, aCaption);
    const caption = component.queryByTestId("caption");

    expect(caption).not.toBeNull();
    expect(caption).toHaveTextContent(aCaption);
  });

  it("should show the abiLogo if there is an abiLogo and useImageResize return some value", () => {
    jest.spyOn(hooks, "useImageResize").mockReturnValue(some([15, 15]));
    const component = getComponent(store, icon, aCaption, anLoyaltyLogo);
    const loyaltyLogo = component.queryByTestId("loyaltyLogo");

    expect(loyaltyLogo).not.toBeNull();
    expect(loyaltyLogo).toHaveProp("source", { uri: anLoyaltyLogo });
  });

  it("should show the blocked badge if is blocked prop is true", () => {
    jest.spyOn(hooks, "useImageResize").mockReturnValue(none);
    const component = getComponent(store, icon, aCaption, undefined, true);
    const blockedBadge = component.queryByTestId("blockedBadge");

    expect(blockedBadge).not.toBeNull();
  });
});

const getComponent = (
  store: Store<unknown>,
  icon: ImageSourcePropType,
  caption?: string,
  cardLogo?: string,
  blocked?: boolean
) =>
  render(
    <Provider store={store}>
      <BasePrivativeCard
        icon={icon}
        caption={caption}
        cardLogo={cardLogo}
        blocked={blocked}
      />
    </Provider>
  );
