import { render } from "@testing-library/react-native";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import { ImageSourcePropType } from "react-native";
import { Provider } from "react-redux";
import { Store } from "redux";
import configureMockStore from "redux-mock-store";
import { Abi } from "../../../../../../definitions/pagopa/walletv2/Abi";
import defaultCardIcon from "../../../../../../img/wallet/cards-icons/unknown.png";
import * as hooks from "../../../onboarding/bancomat/screens/hooks/useImageResize";
import CobadgeCard from "../BaseCoBadgeCard";

jest.mock("../../../onboarding/bancomat/screens/hooks/useImageResize");

const aCaption = "****1234";
const anAbiLogo = "http://127.0.0.1:3000/static_contents/logos/abi/03069.png";
const aBrandLogo = defaultCardIcon;
const anexpiringDateNotExpired = new Date("01/05/2023");
describe("CoBadgeWalletPreview component", () => {
  const mockStore = configureMockStore();
  // eslint-disable-next-line functional/no-let
  let store: ReturnType<typeof mockStore>;

  beforeEach(() => {
    store = mockStore();
  });
  it("should show the abiLogoFallback if there isn't the abiLogo", () => {
    jest.spyOn(hooks, "useImageResize").mockReturnValue(O.none);
    const anAbiWithoutAbilogo = {} as Abi;
    const component = getComponent(store, aBrandLogo, anAbiWithoutAbilogo);
    const abiLogoFallbackComponent = component.queryByTestId("abiLogoFallback");

    expect(abiLogoFallbackComponent).not.toBeNull();
    expect(abiLogoFallbackComponent).toHaveProp("source", {
      testUri: "../../../img/wallet/cards-icons/abiLogoFallback.png"
    });
  });

  it("should show the abiLogo if there is an abiLogo and useImageResize return some value", () => {
    jest.spyOn(hooks, "useImageResize").mockReturnValue(O.some([15, 15]));
    const anAbiWithAbiLogo = { logoUrl: anAbiLogo } as Abi;
    const component = getComponent(store, aBrandLogo, anAbiWithAbiLogo);
    const abiLogo = component.queryByTestId("abiLogo");

    expect(abiLogo).not.toBeNull();
    expect(abiLogo).toHaveProp("source", { uri: anAbiLogo });
  });

  it("should show the expiration date if expiringDate is defined", () => {
    jest.spyOn(hooks, "useImageResize").mockReturnValue(O.none);
    const component = getComponent(
      store,
      aBrandLogo,
      anAbiLogo,
      aCaption,
      anexpiringDateNotExpired
    );
    const expirationDate = component.queryByTestId("expirationDate");

    expect(expirationDate).not.toBeNull();
    expect(expirationDate).toHaveTextContent(`Valid until 01/2023`);
  });

  it("should show the caption if is defined", () => {
    jest.spyOn(hooks, "useImageResize").mockReturnValue(O.none);
    const component = getComponent(store, aBrandLogo, anAbiLogo, aCaption);
    const caption = component.queryByTestId("caption");

    expect(caption).not.toBeNull();
    expect(caption).toHaveTextContent(aCaption);
  });

  it("should show the blocked badge if is blocked prop is true", () => {
    jest.spyOn(hooks, "useImageResize").mockReturnValue(O.none);
    const component = getComponent(
      store,
      aBrandLogo,
      anAbiLogo,
      aCaption,
      anexpiringDateNotExpired,
      true
    );
    const blockedBadge = component.queryByTestId("blockedBadge");

    expect(blockedBadge).not.toBeNull();
  });
});

const getComponent = (
  store: Store<unknown>,
  brandLogo: ImageSourcePropType,
  abi: Abi,
  caption?: string,
  expiringDate?: Date,
  blocked?: boolean
) =>
  render(
    <Provider store={store}>
      <CobadgeCard
        brandLogo={brandLogo}
        caption={caption}
        expiringDate={expiringDate}
        abi={abi}
        blocked={blocked}
      />
    </Provider>
  );
