import { NavigationParams } from "react-navigation";
import { createStore, Store } from "redux";
import { fireEvent } from "@testing-library/react-native";
import { appReducer } from "../../../../../../store/reducers";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { renderScreenFakeNavRedux } from "../../../../../../utils/testWrapper";
import { GlobalState } from "../../../../../../store/reducers/types";
import PayPalPpsSelectionScreen from "../PayPalPspSelectionScreen";
import I18n from "../../../../../../i18n";
import { searchPaypalPsp } from "../../store/actions";
import { pspList } from "./__mock__/psp";

const mockPresentBottomSheet = jest.fn();
jest.mock("../../../../../../utils/bottomSheet", () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const react = require("react-native");
  return {
    __esModule: true,
    BottomSheetScrollView: react.ScrollView,
    TouchableWithoutFeedback: react.TouchableWithoutFeedback,
    useIOBottomSheetRaw: () => ({ present: mockPresentBottomSheet }),
    useIOBottomSheet: () => ({ present: mockPresentBottomSheet })
  };
});

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

  it(`footer buttons should be defined when the psp list is ready`, () => {
    const store = createStore(appReducer, globalState as any);
    const render = renderComponent(store);
    render.store.dispatch(searchPaypalPsp.success(pspList));
    expect(
      render.component.queryByText(I18n.t("global.buttons.cancel"))
    ).not.toBeNull();
    expect(
      render.component.queryByText(I18n.t("global.buttons.continue"))
    ).not.toBeNull();
  });
  it.todo("psp shown should match those one in the store");
  it.todo("loading should be shown when the data is loading");
  it.todo(
    "error and retry button should be shown when some error occurred while retrieving data"
  );

  it(`"what is a psp" link should be defined open a bottom sheet on onPress, when the psp list is ready and `, () => {
    const store = createStore(appReducer, globalState as any);
    const render = renderComponent(store);
    render.store.dispatch(searchPaypalPsp.success(pspList));
    const link = render.component.getByText(
      I18n.t("wallet.onboarding.paypal.selectPsp.link")
    );
    expect(link).not.toBeNull();
    if (link) {
      fireEvent.press(link);
      expect(mockPresentBottomSheet).toBeCalledTimes(1);
    }
  });
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
