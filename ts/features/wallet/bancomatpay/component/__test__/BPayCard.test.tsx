import * as pot from "@pagopa/ts-commons/lib/pot";
import { render } from "@testing-library/react-native";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import { Provider } from "react-redux";
import { Store } from "redux";
import configureMockStore from "redux-mock-store";
import { InitializedProfile } from "../../../../../../definitions/backend/InitializedProfile";
import mockedProfile from "../../../../../__mocks__/initializedProfile";
import * as hooks from "../../../onboarding/bancomat/screens/hooks/useImageResize";
import BPayCard from "../BPayCard";

const aPhone = "+39 34*******0000";
describe("BPayWalletPreview component", () => {
  const mockStore = configureMockStore();
  // eslint-disable-next-line functional/no-let
  let store: ReturnType<typeof mockStore>;

  beforeEach(() => {
    store = mockStore(mockProfileNameSurnameState(mockedProfile));
  });

  it("should show the phone in is defined", () => {
    jest.spyOn(hooks, "useImageResize").mockReturnValue(O.none);
    const component = getComponent(store, aPhone);
    const phone = component.queryByTestId("phone");

    expect(phone).not.toBeNull();
    expect(phone).toHaveTextContent(aPhone);
  });
  it("should show the uppercase name surname in is defined", () => {
    jest.spyOn(hooks, "useImageResize").mockReturnValue(O.none);
    const component = getComponent(store, aPhone);
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

const getComponent = (store: Store<unknown>, phone: string) =>
  render(
    <Provider store={store}>
      <BPayCard phone={phone} />
    </Provider>
  );
