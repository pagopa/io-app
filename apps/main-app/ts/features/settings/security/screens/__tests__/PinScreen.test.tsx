import { createStore } from "redux";
import PinScreen from "../PinScreen";
import { SETTINGS_ROUTES } from "../../../common/navigation/routes";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";

describe("PinScreen", () => {
  it("should render the PinScreen component", () => {
    const { getByTestId } = renderComponent();
    const pinScreen = getByTestId("pinScreenTestID");
    expect(pinScreen).toBeTruthy();
  });

  it("should render the PinCreation component", () => {
    const { getByTestId } = renderComponent();
    const pinCreation = getByTestId("pinScreenTestID");
    expect(pinCreation).toBeTruthy();
  });
});

const renderComponent = () => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);

  return renderScreenWithNavigationStoreContext(
    PinScreen,
    SETTINGS_ROUTES.PIN_SCREEN,
    {},
    store
  );
};
