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
import { AARFlowState, sendAARFlowStates } from "../../utils/stateUtils";
import { SendAARInitialFlowScreen } from "../SendAARInitialFlowScreen";
import * as SELECTORS from "../../store/selectors";
import { sendAarMockStates } from "../../utils/testUtils";
import * as ANALYTICS from "../../analytics";

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
  const flowStateSelectorSpy = jest.spyOn(SELECTORS, "currentAARFlowData");
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
      flowStateSelectorSpy.mockReturnValue({ type: state } as AARFlowState);
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

  sendAarMockStates.forEach(state => {
    it(`should ${
      state.type === sendAARFlowStates.displayingAARToS ? "" : "not "
    }call 'trackSendAARToS' when state is ${state.type}`, () => {
      const spiedOnMockedTrackSendAARToS = jest
        .spyOn(ANALYTICS, "trackSendAARToS")
        .mockImplementation();
      flowStateSelectorSpy.mockReturnValue(state);

      renderComponent();

      if (state.type === sendAARFlowStates.displayingAARToS) {
        expect(spiedOnMockedTrackSendAARToS.mock.calls.length).toBe(1);
        expect(spiedOnMockedTrackSendAARToS.mock.calls[0].length).toBe(0);
      } else {
        expect(spiedOnMockedTrackSendAARToS.mock.calls.length).toBe(0);
      }
    });
  });

  it('should initialize the aar flow state if it is "none"', () => {
    flowStateSelectorSpy.mockReturnValue({ type: sendAARFlowStates.none });
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
    flowStateSelectorSpy.mockReturnValue({
      type: sendAARFlowStates.displayingAARToS
    } as AARFlowState);
    dispatchSpy.mockReturnValue(mockDispatch);
    const component = renderComponentWithStoreAndNavigationContextForFocus(
      componentToRender,
      true
    );
    expect(mockDispatch).not.toHaveBeenCalled();

    await act(() =>
      flowStateSelectorSpy.mockReturnValue({
        type: sendAARFlowStates.none
      } as AARFlowState)
    );
    component.rerender(componentToRender);
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it("should call navigation.setOptions to hide header on mount", () => {
    flowStateSelectorSpy.mockReturnValue({
      type: sendAARFlowStates.fetchingQRData
    } as AARFlowState);
    dispatchSpy.mockReturnValue(mockDispatch);
    renderComponent();
    expect(mockSetOptions).toHaveBeenCalledWith({ headerShown: false });
  });

  [sendAARFlowStates.ko, sendAARFlowStates.notAddresseeFinal].forEach(
    errorState => {
      it(`should replace to error screen when flowState is '${errorState}'`, async () => {
        flowStateSelectorSpy.mockReturnValue({
          type: errorState
        } as AARFlowState);
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
  it(`should replace to the notification display screen when flowState is '${sendAARFlowStates.displayingNotificationData}'`, async () => {
    flowStateSelectorSpy.mockReturnValue({
      type: sendAARFlowStates.displayingNotificationData,
      iun: "TEST_IUN",
      pnServiceId: "SERVICE_ID"
    } as AARFlowState);
    dispatchSpy.mockReturnValue(mockDispatch);
    renderComponent();

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        MESSAGES_ROUTES.MESSAGES_NAVIGATOR,
        {
          screen: PN_ROUTES.MAIN,
          params: {
            screen: PN_ROUTES.MESSAGE_DETAILS,
            params: {
              messageId: "TEST_IUN",
              firstTimeOpening: undefined,
              serviceId: "SERVICE_ID",
              isAarMessage: true
            }
          }
        }
      );
    });
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
