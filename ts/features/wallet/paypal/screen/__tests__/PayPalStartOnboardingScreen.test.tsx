import { createStore, Store } from "redux";
import { NavigationParams } from "react-navigation";
import PayPalStartOnboardingScreen from "../PayPalStartOnboardingScreen";
import { renderScreenFakeNavRedux } from "../../../../../utils/testWrapper";
import { GlobalState } from "../../../../../store/reducers/types";
import { appReducer } from "../../../../../store/reducers";
import { applicationChangeState } from "../../../../../store/actions/application";

describe("PayPalStartOnboardingScreen", () => {
  jest.useFakeTimers();
  it(`match snapshot`, () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    const render = renderComponent(store);
    expect(render).toMatchSnapshot();

    expect(
      render.component.queryByTestId("PayPalStartOnboardingScreen")
    ).not.toBeNull();
    expect(render.component.queryByTestId("cancelButtonId")).not.toBeNull();
    expect(render.component.queryByTestId("continueButtonId")).not.toBeNull();
  });
});

const renderComponent = (store: Store) => ({
  component: renderScreenFakeNavRedux<GlobalState, NavigationParams>(
    PayPalStartOnboardingScreen,
    "N/A",
    {},
    store
  ),
  store
});
