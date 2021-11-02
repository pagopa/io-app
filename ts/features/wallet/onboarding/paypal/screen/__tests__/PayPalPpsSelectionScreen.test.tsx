import { NavigationParams } from "react-navigation";
import { createStore, Store } from "redux";
import { appReducer } from "../../../../../../store/reducers";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { renderScreenFakeNavRedux } from "../../../../../../utils/testWrapper";
import { GlobalState } from "../../../../../../store/reducers/types";
import PayPalPpsSelectionScreen from "../PayPalPspSelectionScreen";

jest.mock("@gorhom/bottom-sheet", () => ({
  useBottomSheetModal: () => ({
    present: jest.fn()
  })
}));

describe("PayPalPpsSelectionScreen", () => {
  jest.useFakeTimers();
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, globalState as any);
  it(`screen should be defined`, () => {
    const render = renderComponent(store);
    expect(
      render.component.queryByTestId("PayPalPpsSelectionScreen")
    ).not.toBeNull();
  });

  it(`footer buttons should be defined`, () => {
    const render = renderComponent(store);
    expect(render.component.queryByTestId("cancelButtonId")).not.toBeNull();
    expect(render.component.queryByTestId("continueButtonId")).not.toBeNull();
  });
  it.todo("psp shown should match those one in the store");
  it.todo("loading should be shown when the data is loading");
  it.todo(
    "error and retry button should be shown when some error occurred while retrieving data"
  );
});

const renderComponent = (store: Store) => ({
  component: renderScreenFakeNavRedux<GlobalState, NavigationParams>(
    PayPalPpsSelectionScreen,
    "N/A",
    {},
    store
  ),
  store
});
