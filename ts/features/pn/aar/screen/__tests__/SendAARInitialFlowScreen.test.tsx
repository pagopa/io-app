import { act, waitFor } from "@testing-library/react-native";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import * as HOOKS from "../../../../../store/hooks";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { renderComponentWithStoreAndNavigationContextForFocus } from "../../../../messages/utils/__tests__/testUtils.test";
import PN_ROUTES from "../../../navigation/routes";
import { setAarFlowState } from "../../store/actions";
import * as REDUCER from "../../store/reducers";
import { sendAARFlowStates } from "../../utils/stateUtils";
import { SendAARInitialFlowScreen } from "../SendAARInitialFlowScreen";

const mockQr = "https://example.com";

describe("SendAARInitialFlowScreen", () => {
  const selectorSpy = jest.spyOn(REDUCER, "currentAARFlowStateType");
  const dispatchSpy = jest.spyOn(HOOKS, "useIODispatch");
  const mockDispatch = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  [
    [
      sendAARFlowStates.displayingAARToS,
      "should render the tos Screen"
    ] as const,
    [
      sendAARFlowStates.fetchingQRData,
      "should render loading tos Screen"
    ] as const
  ].forEach(([state, title]) => {
    it(`${title} when the state is ${state}`, async () => {
      selectorSpy.mockReturnValue(state);
      const { findByTestId } = renderComponent();
      if (state === "displayingAARToS") {
        const data = await waitFor(() => findByTestId("AAR_TOS"));
        expect(data).toBeDefined();
      } else {
        const data = await waitFor(() => findByTestId("LoadingScreenContent"));
        expect(data).toBeDefined();
      }
    });
  });
  it('should initialize the aar flow state if it is "none" ', () => {
    selectorSpy.mockImplementation(() => sendAARFlowStates.none);
    dispatchSpy.mockImplementation(() => mockDispatch);
    renderComponent();
    expect(mockDispatch).toHaveBeenCalledWith(
      setAarFlowState({
        type: sendAARFlowStates.displayingAARToS,
        qrCode: mockQr
      })
    );
    expect(mockDispatch).toHaveBeenCalledTimes(1);
  });
  it("should not re-initialize the aar flow state if it didn't start as 'none' ", async () => {
    dispatchSpy.mockImplementation(() => mockDispatch);
    selectorSpy.mockImplementation(() => sendAARFlowStates.displayingAARToS);
    const component = renderComponentWithStoreAndNavigationContextForFocus(
      componentToRender,
      true
    );
    expect(mockDispatch).not.toHaveBeenCalled();

    await act(() => selectorSpy.mockReturnValue(sendAARFlowStates.none));
    component.rerender(componentToRender);
    expect(mockDispatch).not.toHaveBeenCalled();
  });
});

const componentToRender = <SendAARInitialFlowScreen qrCode={mockQr} />;
function renderComponent() {
  const baseState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, baseState as any);
  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => <SendAARInitialFlowScreen qrCode={mockQr} />,
    PN_ROUTES.QR_SCAN_FLOW,
    {},
    store
  );
}
