import { fireEvent, render } from "@testing-library/react-native";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import CgnUnsubscribe from "../CgnUnsubscribe";

const mockRequestUnsubscription = jest.fn();

jest.mock("../../../hooks/useCgnUnsubscribe", () => ({
  useCgnUnsubscribe: () => ({
    requestUnsubscription: mockRequestUnsubscription
  })
}));

const renderComponent = () => {
  const mockStore = configureMockStore<GlobalState>();
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const store = mockStore(globalState);
  return render(
    <Provider store={store}>
      <CgnUnsubscribe />
    </Provider>
  );
};

describe("CgnUnsubscribe", () => {
  it("should render the unsubscribe button correctly", () => {
    const component = renderComponent();
    expect(component).toBeTruthy();
    expect(
      component.getByTestId("service-cgn-deactivate-bonus-button")
    ).not.toBeNull();
  });

  it("should call requestUnsubscription when the button is pressed", () => {
    const component = renderComponent();

    const button = component.getByTestId("service-cgn-deactivate-bonus-button");
    fireEvent.press(button);

    expect(mockRequestUnsubscription).toHaveBeenCalled();
  });
});