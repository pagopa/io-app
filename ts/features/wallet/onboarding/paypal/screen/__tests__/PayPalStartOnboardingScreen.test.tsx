import { createStore, Store } from "redux";

import PayPalStartOnboardingScreen from "../PayPalStartOnboardingScreen";
import { renderScreenFakeNavRedux } from "../../../../../../utils/testWrapper";
import { GlobalState } from "../../../../../../store/reducers/types";
import { appReducer } from "../../../../../../store/reducers";
import { applicationChangeState } from "../../../../../../store/actions/application";

describe("PayPalStartOnboardingScreen", () => {
  jest.useFakeTimers();
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, globalState as any);
  it(`screen should be defined`, () => {
    const render = renderComponent(store);
    expect(
      render.component.queryByTestId("PayPalStartOnboardingScreen")
    ).not.toBeNull();
  });

  it(`footer buttons should be defined`, () => {
    const render = renderComponent(store);
    expect(render.component.queryByTestId("cancelButtonId")).not.toBeNull();
    expect(render.component.queryByTestId("continueButtonId")).not.toBeNull();
  });

  it(`PayPal logo should be defined`, () => {
    const render = renderComponent(store);
    expect(render.component.queryByTestId("payPalLogo")).not.toBeNull();
  });
});

const renderComponent = (store: Store) => ({
  component: renderScreenFakeNavRedux<GlobalState>(
    PayPalStartOnboardingScreen,
    "N/A",
    {},
    store
  ),
  store
});
