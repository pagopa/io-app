import { createStore, Store } from "redux";
import { NavigationParams } from "react-navigation";
import { appReducer } from "../../../../../../store/reducers";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { renderScreenFakeNavRedux } from "../../../../../../utils/testWrapper";
import { GlobalState } from "../../../../../../store/reducers/types";
import PayPalOnboardingCompletedSuccessComponent from "../PayPalOnboardingCompletedSuccessComponent";
import { setLocale } from "../../../../../../i18n";

describe("PayPalOnboardingCompletedSuccessComponent", () => {
  beforeAll(() => {
    setLocale("it");
  });
  jest.useFakeTimers();
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, globalState as any);
  it(`should match the snapshot`, () => {
    const render = renderComponent(store);
    expect(render.component.toJSON()).toMatchSnapshot();
  });

  it(`screen should be defined`, () => {
    const render = renderComponent(store);
    expect(
      render.component.queryByTestId("InfoScreenComponent")
    ).not.toBeNull();
  });

  it(`buttons should be defined`, () => {
    const render = renderComponent(store);
    expect(render.component.queryByTestId("primaryButtonId")).not.toBeNull();
  });
});

const renderComponent = (store: Store) => ({
  component: renderScreenFakeNavRedux<GlobalState, NavigationParams>(
    PayPalOnboardingCompletedSuccessComponent,
    "N/A",
    {},
    store
  ),
  store
});
