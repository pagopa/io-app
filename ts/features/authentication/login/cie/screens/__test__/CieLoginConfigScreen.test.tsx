import { createStore } from "redux";
import CieLoginConfigScreen from "../CieLoginConfigScreen";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import { appReducer } from "../../../../../../store/reducers";
import { applicationChangeState } from "../../../../../../store/actions/application";

describe("CieLoginConfigScreen", () => {
  it("renders the OTPInput initially", () => {
    const { getByTestId } = renderComponent();
    expect(getByTestId("CieLoginConfigScreen")).toBeTruthy();
  });

  it("renders the locked screen initially (PIN view)", () => {
    const { toJSON } = renderComponent();
    expect(toJSON()).toMatchSnapshot();
  });
});

function renderComponent() {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);

  return renderScreenWithNavigationStoreContext(
    () => <CieLoginConfigScreen />,
    "DUMMY",
    {},
    store
  );
}
