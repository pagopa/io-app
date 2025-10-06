import { act, waitFor } from "@testing-library/react-native";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import * as HOOKS from "../../../../../store/hooks";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { MESSAGES_ROUTES } from "../../../../messages/navigation/routes";
import { renderComponentWithStoreAndNavigationContextForFocus } from "../../../../messages/utils/__tests__/testUtils.test";
import PN_ROUTES from "../../../navigation/routes";
import { setAarFlowState } from "../../store/actions";
import * as REDUCER from "../../store/reducers";
import { sendAARFlowStates } from "../../utils/stateUtils";
import { SendAARInitialFlowScreen } from "../SendAARInitialFlowScreen";

const mockReplace = jest.fn();
const mockSetOptions = jest.fn();

jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useNavigation: () => ({
      ...actualNav.useNavigation?.(),
      replace: mockReplace,
      setOptions: mockSetOptions
    })
  };
});

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
    [sendAARFlowStates.fetchingQRData, "should render loading screen"] as const
  ].forEach(([state, title]) => {
    it(`${title} when the state is ${state}`, async () => {
      selectorSpy.mockReturnValue(state);
      const { findByTestId } = renderComponent();
      if (state === sendAARFlowStates.displayingAARToS) {
        const data = await waitFor(() => findByTestId("AAR_TOS"));
        expect(data).toBeDefined();
      } else {
        const data = await waitFor(() => findByTestId("LoadingScreenContent"));
        expect(data).toBeDefined();
      }
    });
  });

  it('should initialize the aar flow state if it is "none"', () => {
    selectorSpy.mockReturnValue(sendAARFlowStates.none);
    dispatchSpy.mockReturnValue(mockDispatch);
    renderComponent();
    expect(mockDispatch).toHaveBeenCalledWith(
      setAarFlowState({
        type: sendAARFlowStates.displayingAARToS,
        qrCode: mockQr
      })
    );
    expect(mockDispatch).toHaveBeenCalledTimes(1);
  });

  it("should not re-initialize the aar flow state if it didn't start as 'none'", async () => {
    selectorSpy.mockReturnValue(sendAARFlowStates.displayingAARToS);
    dispatchSpy.mockReturnValue(mockDispatch);
    const component = renderComponentWithStoreAndNavigationContextForFocus(
      componentToRender,
      true
    );
    expect(mockDispatch).not.toHaveBeenCalled();

    await act(() => selectorSpy.mockReturnValue(sendAARFlowStates.none));
    component.rerender(componentToRender);
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it("should call navigation.setOptions to hide header on mount", () => {
    selectorSpy.mockReturnValue(sendAARFlowStates.fetchingQRData);
    dispatchSpy.mockReturnValue(mockDispatch);
    renderComponent();
    expect(mockSetOptions).toHaveBeenCalledWith({ headerShown: false });
  });

  [sendAARFlowStates.ko, sendAARFlowStates.notAddresseeFinal].forEach(
    errorState => {
      it(`should replace to error screen when flowState is '${errorState}'`, async () => {
        selectorSpy.mockReturnValue(errorState);
        dispatchSpy.mockReturnValue(mockDispatch);
        renderComponent();

        await waitFor(() => {
          expect(mockReplace).toHaveBeenCalledWith(
            MESSAGES_ROUTES.MESSAGES_NAVIGATOR,
            {
              screen: PN_ROUTES.MAIN,
              params: {
                screen: PN_ROUTES.SEND_AAR_ERROR
              }
            }
          );
        });
      });
    }
  );
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
