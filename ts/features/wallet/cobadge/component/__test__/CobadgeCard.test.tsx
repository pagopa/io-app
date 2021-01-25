import { render } from "@testing-library/react-native";
import * as React from "react";
import { ImageSourcePropType } from "react-native";
import { Store } from "redux";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import { pot } from "italia-ts-commons";
import { none, some } from "fp-ts/lib/Option";
import * as hooks from "../../../onboarding/bancomat/screens/hooks/useImageResize";
import CobadgeCard from "../CobadgeCard";
import { InitializedProfile } from "../../../../../../definitions/backend/InitializedProfile";

jest.mock("../../../onboarding/bancomat/screens/hooks/useImageResize");

const profile: InitializedProfile = {
  family_name: "Rossi",
  name: "Maria"
} as InitializedProfile;

const aBankName = "Bank Name";
const aPhone = "+39 34*******0000";
const anAbiLogo = "http://127.0.0.1:3000/static_contents/logos/abi/03069.png";
describe("BPayWalletPreview component", () => {
  const mockStore = configureMockStore();
  // eslint-disable-next-line functional/no-let
  let store: ReturnType<typeof mockStore>;

  beforeEach(() => {
    store = mockStore(mockProfileNameSurnameState(profile));
  });
  it("should show the bankName if there isn't the abiLogo", () => {
    jest.spyOn(hooks, "useImageResize").mockReturnValue(none);
    const component = getComponent(store, aBankName);
    const bankName = component.queryByTestId("bankName");

    expect(bankName).not.toBeNull();
    expect(bankName).toHaveTextContent(aBankName);
  });

  // it("should show the abiLog if there is an abiLogo and useImageResize return some value", () => {
  //   jest.spyOn(hooks, "useImageResize").mockReturnValue(some([15, 15]));
  //   const component = getComponent(store, aBankName, anAbiLogo);
  //   const abiLogo = component.queryByTestId("abiLogo");

  //   expect(abiLogo).not.toBeNull();
  //   expect(abiLogo).toHaveProp("source", { uri: anAbiLogo });
  // });

  // it("should show the phone in is defined", () => {
  //   jest.spyOn(hooks, "useImageResize").mockReturnValue(none);
  //   const component = getComponent(store, aBankName, anAbiLogo, aPhone);
  //   const phone = component.queryByTestId("phone");

  //   expect(phone).not.toBeNull();
  //   expect(phone).toHaveTextContent(aPhone);
  // });
  // it("should show the uppercase name surname in is defined", () => {
  //   jest.spyOn(hooks, "useImageResize").mockReturnValue(none);
  //   const component = getComponent(store, aBankName);
  //   const nameSurname = component.queryByTestId("nameSurname");

  //   expect(nameSurname).not.toBeNull();
  //   expect(nameSurname).toHaveTextContent(
  //     `${profile.name.toUpperCase()} ${profile.family_name.toLocaleUpperCase()}`
  //   );
  // });
});

const mockProfileNameSurnameState = (profile: InitializedProfile) => ({
  profile: pot.some(profile)
});

const getComponent = (
  store: Store<unknown>,
  brandLogo: ImageSourcePropType,
  caption?: string,
  expireMonth?: string,
  expireYear?: string,
  abiLogo?: string
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
