import { createStore } from "redux";
import { fireEvent } from "@testing-library/react-native";
import { appReducer } from "../../../../../../store/reducers";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { renderScreenFakeNavRedux } from "../../../../../../utils/testWrapper";
import { GlobalState } from "../../../../../../store/reducers/types";
import PayPalPpsSelectionScreen from "../PayPalPspSelectionScreen";
import I18n from "../../../../../../i18n";
import { searchPaypalPsp } from "../../store/actions";
import { getNetworkError } from "../../../../../../utils/errors";
import { pspList } from "../__mocks__/psp";

const mockPresentBottomSheet = jest.fn();

jest.mock("../../../../../../utils/hooks/bottomSheet", () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const react = require("react-native");
  return {
    __esModule: true,
    BottomSheetScrollView: react.ScrollView,
    TouchableWithoutFeedback: react.TouchableWithoutFeedback,
    useLegacyIOBottomSheetModal: () => ({ present: mockPresentBottomSheet })
  };
});

describe("PayPalPpsSelectionScreen", () => {
  jest.useFakeTimers();
  it(`screen should be defined when the psp list is ready`, () => {
    const render = renderComponent();
    render.store.dispatch(searchPaypalPsp.success(pspList));
    expect(
      render.component.queryByTestId("PayPalPpsSelectionScreen")
    ).not.toBeNull();
  });

  it(`footer buttons should be defined when the psp list is ready`, () => {
    const render = renderComponent();
    render.store.dispatch(searchPaypalPsp.success(pspList));
    expect(
      render.component.queryByText(I18n.t("global.buttons.cancel"))
    ).not.toBeNull();
    expect(
      render.component.queryByText(I18n.t("global.buttons.continue"))
    ).not.toBeNull();
  });
  it("psp items shown should match those one in the store", () => {
    const render = renderComponent();
    render.store.dispatch(searchPaypalPsp.success(pspList));
    pspList.forEach(psp => {
      expect(
        render.component.queryByTestId(`pspItemTestID_${psp.id}`)
      ).not.toBeNull();
    });
  });
  it("loading should be shown when the data is loading", () => {
    const render = renderComponent();
    render.store.dispatch(searchPaypalPsp.request());
    expect(
      render.component.queryByTestId(`PayPalPpsSelectionScreenLoadingError`)
    ).not.toBeNull();
  });
  it("error and retry button should be shown when some error occurred while retrieving data", () => {
    const render = renderComponent();
    render.store.dispatch(
      searchPaypalPsp.failure(getNetworkError(new Error("test")))
    );
    expect(
      render.component.queryByTestId(`LoadingErrorComponentError`)
    ).not.toBeNull();
  });

  it(`"what is a psp" link should be defined open a bottom sheet on onPress, when the psp list is ready`, () => {
    const render = renderComponent();
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

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, globalState as any);
  return {
    component: renderScreenFakeNavRedux<GlobalState>(
      PayPalPpsSelectionScreen,
      "N/A",
      {},
      store
    ),
    store
  };
};
