import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { ITW_ROUTES } from "../../../navigation/routes";
import { ItwAlreadyActiveScreen } from "../ItwAlreadyActiveScreen";

beforeAll(() => {
  jest.useFakeTimers();
});

afterAll(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

describe("Test ItwAlreadyActive screen", () => {
  it("it should render the screen correctly", () => {
    const component = renderComponent();
    expect(component).toBeTruthy();
  });
});

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => <ItwAlreadyActiveScreen />,
    ITW_ROUTES.DISCOVERY.ALREADY_ACTIVE_SCREEN,
    {},
    createStore(appReducer, globalState as any)
  );
};
