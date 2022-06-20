import * as pot from "@pagopa/ts-commons/lib/pot";
import { render } from "@testing-library/react-native";
import { none, some } from "fp-ts/lib/Option";
import * as React from "react";
import { Provider } from "react-redux";
import { Store } from "redux";
import configureMockStore from "redux-mock-store";
import { InitializedProfile } from "../../../../../../definitions/backend/InitializedProfile";
import mockedProfile from "../../../../../__mocks__/initializedProfile";
import * as hooks from "../../../onboarding/bancomat/screens/hooks/useImageResize";
import BPayCard from "../BPayCard";

const aBankName = "Bank Name";
const aPhone = "+39 34*******0000";
const anAbiLogo = "http://127.0.0.1:3000/static_contents/logos/abi/03069.png";
describe("BPayWalletPreview component", () => {
  const mockStore = configureMockStore();
  // eslint-disable-next-line functional/no-let
  let store: ReturnType<typeof mockStore>;

  beforeEach(() => {
    store = mockStore(mockProfileNameSurnameState(mockedProfile));
  });
  it("should show the bankName if there isn't the abiLogo", () => {
    jest.spyOn(hooks, "useImageResize").mockReturnValue(none);
    const component = getComponent(store, aBankName);
    const bankName = component.queryByTestId("bankName");

    expect(bankName).not.toBeNull();
    expect(bankName).toHaveTextContent(aBankName);
  });

  it("should show the abiLog if there is an abiLogo and useImageResize return some value", () => {
    jest.spyOn(hooks, "useImageResize").mockReturnValue(some([15, 15]));
    const component = getComponent(store, aBankName, anAbiLogo);
    const abiLogo = component.queryByTestId("abiLogo");

    expect(abiLogo).not.toBeNull();
    expect(abiLogo).toHaveProp("source", { uri: anAbiLogo });
  });

  it("should show the phone in is defined", () => {
    jest.spyOn(hooks, "useImageResize").mockReturnValue(none);
    const component = getComponent(store, aBankName, anAbiLogo, aPhone);
    const phone = component.queryByTestId("phone");

    expect(phone).not.toBeNull();
    expect(phone).toHaveTextContent(aPhone);
  });
  it("should show the uppercase name surname in is defined", () => {
    jest.spyOn(hooks, "useImageResize").mockReturnValue(none);
    const component = getComponent(store, aBankName);
    const nameSurname = component.queryByTestId("nameSurname");

    expect(nameSurname).not.toBeNull();
    expect(nameSurname).toHaveTextContent(
      `${mockedProfile.name.toUpperCase()} ${mockedProfile.family_name.toLocaleUpperCase()}`
    );
  });
});

const mockProfileNameSurnameState = (profile: InitializedProfile) => ({
  profile: pot.some(profile)
});

const getComponent = (
  store: Store<unknown>,
  bankName: string,
  abiLogo?: string,
  phone?: string
) =>
  render(
    <Provider store={store}>
      <BPayCard bankName={bankName} phone={phone} abiLogo={abiLogo} />
    </Provider>
  );
