import { render } from "@testing-library/react-native";
import * as React from "react";
import { ImageSourcePropType } from "react-native";
import { Store } from "redux";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
// import { pot } from "italia-ts-commons";
import { none, some } from "fp-ts/lib/Option";
import * as hooks from "../../../onboarding/bancomat/screens/hooks/useImageResize";
import CobadgeCard from "../BaseCoBadgeCard";
import defaultCardIcon from "../../../../../../img/wallet/cards-icons/unknown.png";

jest.mock("../../../onboarding/bancomat/screens/hooks/useImageResize");

const aCaption = "****1234";
const anAbiLogo = "http://127.0.0.1:3000/static_contents/logos/abi/03069.png";
const aBrandLogo = defaultCardIcon;
const anExpireMonth = "6";
const anExpireYear = "2021";
describe("CoBadgeWalletPreview component", () => {
  const mockStore = configureMockStore();
  // eslint-disable-next-line functional/no-let
  let store: ReturnType<typeof mockStore>;

  beforeEach(() => {
    store = mockStore();
  });
  it("should show the abiLogoFallback if there isn't the abiLogo", () => {
    jest.spyOn(hooks, "useImageResize").mockReturnValue(none);
    const component = getComponent(store, aBrandLogo);
    const abiLogoFallbackComponent = component.queryByTestId("abiLogoFallback");

    expect(abiLogoFallbackComponent).not.toBeNull();
    expect(abiLogoFallbackComponent).toHaveProp("source", {
      testUri: "../../../img/wallet/cards-icons/abiLogoFallback.png"
    });
  });

  it("should show the abiLogo if there is an abiLogo and useImageResize return some value", () => {
    jest.spyOn(hooks, "useImageResize").mockReturnValue(some([15, 15]));
    const component = getComponent(store, aBrandLogo, anAbiLogo);
    const abiLogo = component.queryByTestId("abiLogo");

    expect(abiLogo).not.toBeNull();
    expect(abiLogo).toHaveProp("source", { uri: anAbiLogo });
  });

  it("should show the expiration date if both expireMonth and expireYear are defined", () => {
    jest.spyOn(hooks, "useImageResize").mockReturnValue(none);
    const component = getComponent(
      store,
      aBrandLogo,
      anAbiLogo,
      aCaption,
      anExpireMonth,
      anExpireYear
    );
    const expirationDate = component.queryByTestId("expirationDate");

    expect(expirationDate).not.toBeNull();
    expect(expirationDate).toHaveTextContent(
      `Valid until ${anExpireMonth}/${anExpireYear}`
    );
  });

  it("should show the caption if is defined", () => {
    jest.spyOn(hooks, "useImageResize").mockReturnValue(none);
    const component = getComponent(store, aBrandLogo, anAbiLogo, aCaption);
    const caption = component.queryByTestId("caption");

    expect(caption).not.toBeNull();
    expect(caption).toHaveTextContent(aCaption);
  });
});

const getComponent = (
  store: Store<unknown>,
  brandLogo: ImageSourcePropType,
  abiLogo?: string,
  caption?: string,
  expireMonth?: string,
  expireYear?: string
) =>
  render(
    <Provider store={store}>
      <CobadgeCard
        brandLogo={brandLogo}
        caption={caption}
        expireMonth={expireMonth}
        expireYear={expireYear}
        abiLogo={abiLogo}
      />
    </Provider>
  );
