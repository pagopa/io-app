import _ from "lodash";
import { act, waitFor } from "@testing-library/react-native";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import * as HOOKS from "../../../../../store/hooks";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { renderComponentWithStoreAndNavigationContextForFocus } from "../../../../messages/utils/__tests__/testUtils.test";
import PN_ROUTES from "../../../navigation/routes";
import * as ANALYTICS from "../../analytics";
import { setAarFlowState } from "../../store/actions";
import * as SELECTORS from "../../store/selectors";
import { AarFlowState, sendAarFlowStates } from "../../utils/stateUtils";
import { sendAarMockStates } from "../../utils/testUtils";
import { SendAarInitialFlowScreen } from "../SendAarInitialFlowScreen";

const mockReplace = jest.fn();
const mockSetOptions = jest.fn();
const mockShouldNeverCall = jest.fn();

jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useNavigation: () =>
      new Proxy(actualNav.useNavigation?.(), {
        get: (_target, prop) => {
          if (prop === "replace") {
            return mockReplace;
          }
          if (prop === "setOptions") {
            return mockSetOptions;
          }
          if (prop === "addListener") {
            return jest.fn(() => jest.fn());
          }
          return mockShouldNeverCall;
        }
      })
  };
});

const mockQr = "https://example.com";

describe("SendAarInitialFlowScreen", () => {
  const flowStateSelectorSpy = jest.spyOn(SELECTORS, "currentAarFlowData");
  const dispatchSpy = jest.spyOn(HOOKS, "useIODispatch");
  const mockDispatch = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  [
    [
      sendAarFlowStates.displayingAarToS,
      "should render the tos Screen"
    ] as const,
    [sendAarFlowStates.fetchingQRData, "should render loading screen"] as const
  ].forEach(([state, title]) => {
    it(`${title} when the state is ${state}`, async () => {
      flowStateSelectorSpy.mockReturnValue({ type: state } as AarFlowState);
      const { findByTestId } = renderComponent();
      if (state === sendAarFlowStates.displayingAarToS) {
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
      state.type === sendAarFlowStates.displayingAarToS ? "" : "not "
    }call 'trackSendAarToS' when state is ${state.type}`, () => {
      const spiedOnMockedTrackSendAarToS = jest
        .spyOn(ANALYTICS, "trackSendAarToS")
        .mockImplementation();
      flowStateSelectorSpy.mockReturnValue(state);

      renderComponent();

      if (state.type === sendAarFlowStates.displayingAarToS) {
        expect(spiedOnMockedTrackSendAarToS.mock.calls.length).toBe(1);
        expect(spiedOnMockedTrackSendAarToS.mock.calls[0].length).toBe(0);
      } else {
        expect(spiedOnMockedTrackSendAarToS.mock.calls.length).toBe(0);
      }
    });

    it(`should never call any non-replace navigation action when type is "${state.type}"`, () => {
      flowStateSelectorSpy.mockReturnValue(state);
      dispatchSpy.mockReturnValue(mockDispatch);

      renderComponent();

      expect(mockShouldNeverCall).not.toHaveBeenCalled();
    });
  });

  it('should initialize the aar flow state if it is "none"', () => {
    flowStateSelectorSpy.mockReturnValue({ type: sendAarFlowStates.none });
    dispatchSpy.mockReturnValue(mockDispatch);
    renderComponent();
    expect(mockDispatch).toHaveBeenCalledWith(
      setAarFlowState({
        type: sendAarFlowStates.displayingAarToS,
        qrCode: mockQr
      })
    );
    expect(mockDispatch).toHaveBeenCalledTimes(1);
  });

  it("should not re-initialize the aar flow state if it didn't start as 'none'", async () => {
    flowStateSelectorSpy.mockReturnValue({
      type: sendAarFlowStates.displayingAarToS
    } as AarFlowState);
    dispatchSpy.mockReturnValue(mockDispatch);
    const component = renderComponentWithStoreAndNavigationContextForFocus(
      componentToRender,
      true
    );
    expect(mockDispatch).not.toHaveBeenCalled();

    await act(() =>
      flowStateSelectorSpy.mockReturnValue({
        type: sendAarFlowStates.none
      } as AarFlowState)
    );
    component.rerender(componentToRender);
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it("should call navigation.setOptions to hide header on mount", () => {
    flowStateSelectorSpy.mockReturnValue({
      type: sendAarFlowStates.fetchingQRData
    } as AarFlowState);
    dispatchSpy.mockReturnValue(mockDispatch);
    renderComponent();
    expect(mockSetOptions).toHaveBeenCalledWith({ headerShown: false });
  });

  [sendAarFlowStates.ko, sendAarFlowStates.notAddresseeFinal].forEach(
    errorState => {
      it(`should replace to error screen when flowState is '${errorState}'`, async () => {
        flowStateSelectorSpy.mockReturnValue({
          type: errorState
        } as AarFlowState);
        dispatchSpy.mockReturnValue(mockDispatch);
        renderComponent();

        await waitFor(() => {
          expect(mockReplace).toHaveBeenCalledWith(PN_ROUTES.SEND_AAR_ERROR);
        });
      });
    }
  );
  it(`should replace to the delegation proposal screen screen when flowState is '${sendAarFlowStates.notAddressee}'`, async () => {
    flowStateSelectorSpy.mockReturnValue({
      type: sendAarFlowStates.notAddressee
    } as AarFlowState);
    dispatchSpy.mockReturnValue(mockDispatch);
    renderComponent();

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        PN_ROUTES.SEND_AAR_DELEGATION_PROPOSAL
      );
    });
  });
  [undefined, "572d8247-92bb-4c01-8e15-d0966a9b7506"].forEach(mandateId => {
    it(`should replace to the notification display screen when flowState is '${sendAarFlowStates.displayingNotificationData}'`, async () => {
      flowStateSelectorSpy.mockReturnValue({
        type: sendAarFlowStates.displayingNotificationData,
        iun: "TEST_IUN",
        pnServiceId: "SERVICE_ID",
        mandateId
      } as AarFlowState);
      dispatchSpy.mockReturnValue(mockDispatch);
      renderComponent();

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith(PN_ROUTES.MESSAGE_DETAILS, {
          messageId: "TEST_IUN",
          firstTimeOpening: undefined,
          serviceId: "SERVICE_ID",
          sendOpeningSource: "aar",
          sendUserType: mandateId != null ? "mandatory" : "recipient"
        });
      });
    });
  });
});

const componentToRender = <SendAarInitialFlowScreen qrCode={mockQr} />;
function renderComponent() {
  const baseState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, baseState as any);
  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => <SendAarInitialFlowScreen qrCode={mockQr} />,
    PN_ROUTES.QR_SCAN_FLOW,
    {},
    store
  );
}
