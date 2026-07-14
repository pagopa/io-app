import { createStore } from "redux";

import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import CieLoginConfigScreen from "../CieLoginConfigScreen";

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
