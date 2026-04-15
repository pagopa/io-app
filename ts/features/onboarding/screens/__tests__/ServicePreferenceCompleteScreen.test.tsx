import { fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import ServicePreferenceCompleteScreen from "../ServicePreferenceCompleteScreen";
import ROUTES from "../../../../navigation/routes";

jest.mock("../../store/actions", () => ({
  ...jest.requireActual("../../store/actions"),
  servicesOptinCompleted: jest.fn(() => ({
    type: "MOCK_SERVICES_OPTIN_COMPLETED"
  }))
}));

const initialState = appReducer(undefined, applicationChangeState("active"));
const store = createStore(appReducer, initialState as any);

describe("ServicePreferenceCompleteScreen", () => {
  it("renders correctly", () => {
    const { toJSON, getByText } = renderComponent();

    expect(toJSON()).toMatchSnapshot();
    expect(getByText("Continua")).toBeTruthy();
  });

  it("dispatches servicesOptinCompleted on button press", () => {
    const dispatchSpy = jest.spyOn(store, "dispatch");

    const { getByText } = renderComponent();

    fireEvent.press(getByText("Continua"));

    expect(dispatchSpy).toHaveBeenCalledWith({
      type: "MOCK_SERVICES_OPTIN_COMPLETED"
    });
  });
});

const renderComponent = () =>
  renderScreenWithNavigationStoreContext(
    ServicePreferenceCompleteScreen,
    ROUTES.ONBOARDING_SERVICES_PREFERENCE_COMPLETE,
    {},
    store
  );
