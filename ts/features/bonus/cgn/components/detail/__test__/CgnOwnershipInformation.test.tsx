import * as pot from "@pagopa/ts-commons/lib/pot";
import { render } from "@testing-library/react-native";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import mockedProfile from "../../../../../../__mocks__/initializedProfile";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import CgnOwnershipInformation from "../CgnOwnershipInformation";

const renderComponent = (state: GlobalState) => {
  const mockStore = configureMockStore<GlobalState>();

  const store = mockStore(state);
  return render(
    <Provider store={store}>
      <CgnOwnershipInformation />
    </Provider>
  );
};
const globalState = appReducer(undefined, applicationChangeState("active"));

describe("CgnOwnershipInformation", () => {
  it("should render the ownership information correctly", () => {
    const component = renderComponent({
      ...globalState,
      profile: pot.some(mockedProfile)
    });

    expect(component).toBeTruthy();
    expect(component.getByText("Nome")).not.toBeNull();
    expect(component.getByText("Cognome")).not.toBeNull();
    expect(component.getByText("Codice Fiscale")).not.toBeNull();
    expect(component.getByText(mockedProfile.name)).not.toBeNull();
    expect(component.getByText(mockedProfile.family_name)).not.toBeNull();
    expect(component.getByText(mockedProfile.fiscal_code)).not.toBeNull();
  });

  it("should not render the ownership information if profile is not available", () => {
    const component = renderComponent({
      ...globalState,
      profile: pot.none
    });

    expect(component).toBeTruthy();
    expect(component.queryByText("Nome")).toBeNull();
    expect(component.queryByText("Cognome")).toBeNull();
    expect(component.queryByText("Codice Fiscale")).toBeNull();
  });
});
