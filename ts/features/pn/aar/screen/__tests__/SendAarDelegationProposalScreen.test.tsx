import { act, fireEvent, waitFor } from "@testing-library/react-native";
import { createStore } from "redux";
import * as NAVIGATION from "../../../../../navigation/params/AppParamsList";
import { applicationChangeState } from "../../../../../store/actions/application";
import * as USEIO_HOOKS from "../../../../../store/hooks";
import { appReducer } from "../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import PN_ROUTES from "../../../navigation/routes";
import * as NFC_AVAILABLE from "../../hooks/useIsNfcFeatureAvailable";
import * as BS_HOOK from "../../hooks/useSendAarDelegationProposalScreenBottomSheet";
import { setAarFlowState } from "../../store/actions";
import { sendAARFlowStates } from "../../utils/stateUtils";
import {
  sendAarMockStateFactory,
  sendAarMockStates
} from "../../utils/testUtils";
import * as FLOW_MANAGER from "../../hooks/useSendAarFlowManager";
import {
  trackSendAarNotificationOpeningMandateDisclaimer,
  trackSendAarNotificationOpeningMandateDisclaimerAccepted,
  trackSendAarNotificationOpeningMandateDisclaimerClosure,
  trackSendAarNotificationOpeningMandateBottomSheet
} from "../../analytics";
import { SendAarDelegationProposalScreen } from "../SendAarDelegationProposalScreen";

// react-native-gesture-handler keeps a global state for Gesture Handlers (e.g. handlerTag)
// that is incremented every time a handler is mounted and is NOT reset between tests.
// When new tests are added, this makes snapshots unstable and dependent on the execution order
// (different handlerTag values across runs).
// By mocking Gesture Handlers with simple Views we avoid global side effects and
// ensure deterministic and stable tests and snapshots.
jest.mock("react-native-gesture-handler", () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { View } = require("react-native");

  return {
    ...jest.requireActual("react-native-gesture-handler"),
    PanGestureHandler: View
  };
});

const currentStateMockData = sendAarMockStateFactory.notAddressee();
const mockPresent = jest.fn();
const mockDispatch = jest.fn();
const mockReplace = jest.fn();
const mockBottomSheet = (_props: {
  citizenName: string;
  onIdentificationSuccess?: () => void;
  onIdentificationCancel?: () => void;
}) => ({
  bottomSheet: <></>,
  present: mockPresent,
  dismiss: jest.fn()
});
const mockToastWarning = jest.fn();
const mockToastHideAll = jest.fn();

jest.mock("@pagopa/io-app-design-system", () => ({
  ...jest.requireActual("@pagopa/io-app-design-system"),
  useIOToast: () => ({
    show: (_message: string, _options?: unknown) => jest.fn(),
    error: jest.fn(),
    warning: mockToastWarning,
    success: jest.fn(),
    info: (_message: string) => jest.fn(),
    hideAll: mockToastHideAll,
    hide: (_id: number) => jest.fn()
  })
}));

jest.mock("../../analytics", () => ({
  trackSendAarNotificationOpeningMandateDisclaimer: jest.fn(),
  trackSendAarNotificationOpeningMandateDisclaimerAccepted: jest.fn(),
  trackSendAarNotificationOpeningMandateDisclaimerClosure: jest.fn(),
  trackSendAarNotificationOpeningMandateBottomSheet: jest.fn()
}));

describe("SendAarDelegationProposalScreen", () => {
  const useIODispatchSpy = jest.spyOn(USEIO_HOOKS, "useIODispatch");
  const useIsNfcFeatureAvailableSpy = jest.spyOn(
    NFC_AVAILABLE,
    "useIsNfcFeatureAvailable"
  );
  const useIONavigationSpy = jest.spyOn(NAVIGATION, "useIONavigation");

  beforeEach(() => {
    jest.clearAllMocks();
    jest
      .spyOn(BS_HOOK, "useSendAarDelegationProposalScreenBottomSheet")
      .mockImplementation(mockBottomSheet);
    useIODispatchSpy.mockImplementation(() => mockDispatch);
    useIsNfcFeatureAvailableSpy.mockImplementation();
    useIONavigationSpy.mockImplementation(
      () =>
        ({
          replace: mockReplace
        } as unknown as ReturnType<typeof NAVIGATION.useIONavigation>)
    );
  });

  describe("Delegation screen content", () => {
    sendAarMockStates.forEach(currentFlowData => {
      const isNotAddresseState =
        currentFlowData.type === sendAARFlowStates.notAddressee;

      it(`${
        isNotAddresseState ? "should" : "should not"
      } invoke "trackSendAarNotificationOpeningMandateDisclaimer" on component mount if currentFlowData is "${
        currentFlowData.type
      }"`, async () => {
        jest
          .spyOn(FLOW_MANAGER, "useSendAarFlowManager")
          .mockImplementation(() => ({
            terminateFlow: jest.fn(),
            goToNextState: jest.fn(),
            currentFlowData
          }));

        renderScreen();

        if (isNotAddresseState) {
          await waitFor(() => {
            expect(
              trackSendAarNotificationOpeningMandateDisclaimer
            ).toHaveBeenCalledTimes(1);
          });
        } else {
          expect(
            trackSendAarNotificationOpeningMandateDisclaimer
          ).not.toHaveBeenCalled();
        }
      });
    });

    describe("CTA press behavior", () => {
      [true, false].forEach(isNfcAvailable => {
        it(`behaves correctly on button press when the NFC feature ${
          isNfcAvailable ? "is" : "isn't"
        } available`, () => {
          jest
            .spyOn(FLOW_MANAGER, "useSendAarFlowManager")
            .mockImplementation(() => ({
              terminateFlow: jest.fn(),
              goToNextState: jest.fn(),
              currentFlowData: sendAarMockStateFactory.notAddressee()
            }));
          useIsNfcFeatureAvailableSpy.mockReturnValue(isNfcAvailable);
          const { getByTestId } = renderScreen();
          const button = getByTestId("continue-button");
          expect(button).toBeDefined();

          expect(mockPresent).not.toHaveBeenCalled();
          expect(
            trackSendAarNotificationOpeningMandateDisclaimerAccepted
          ).not.toHaveBeenCalled();

          act(() => {
            fireEvent.press(button);
          });

          expect(
            trackSendAarNotificationOpeningMandateDisclaimerAccepted
          ).toHaveBeenCalledTimes(1);

          if (isNfcAvailable) {
            expect(mockPresent).toHaveBeenCalled();
            expect(
              trackSendAarNotificationOpeningMandateBottomSheet
            ).toHaveBeenCalledTimes(1);
            expect(mockDispatch).not.toHaveBeenCalled();
          } else {
            expect(mockPresent).not.toHaveBeenCalled();
            expect(
              trackSendAarNotificationOpeningMandateBottomSheet
            ).not.toHaveBeenCalled();
            expect(mockDispatch).toHaveBeenCalledTimes(1);
            expect(mockDispatch).toHaveBeenCalledWith(
              setAarFlowState({
                ...currentStateMockData,
                type: sendAARFlowStates.nfcNotSupportedFinal
              })
            );
          }
        });
      });
      it("should invoke terminateFlow on close button press", () => {
        const mockTerminateFlow = jest.fn();
        jest
          .spyOn(FLOW_MANAGER, "useSendAarFlowManager")
          .mockImplementation(() => ({
            terminateFlow: mockTerminateFlow,
            goToNextState: jest.fn(),
            currentFlowData: sendAarMockStateFactory.notAddressee()
          }));

        const { getByTestId } = renderScreen();

        const closeButton = getByTestId("close-button");
        expect(closeButton).toBeDefined();

        expect(mockTerminateFlow).not.toHaveBeenCalled();
        expect(
          trackSendAarNotificationOpeningMandateDisclaimerClosure
        ).not.toHaveBeenCalled();

        act(() => {
          fireEvent.press(closeButton);
        });

        expect(mockTerminateFlow).toHaveReturnedTimes(1);
        expect(
          trackSendAarNotificationOpeningMandateDisclaimerClosure
        ).toHaveReturnedTimes(1);

        expect(
          trackSendAarNotificationOpeningMandateDisclaimerAccepted
        ).not.toHaveBeenCalled();
        expect(
          trackSendAarNotificationOpeningMandateBottomSheet
        ).not.toHaveBeenCalled();
        expect(mockPresent).not.toHaveBeenCalled();
        expect(mockDispatch).not.toHaveBeenCalled();
      });
    });
  });

  describe("navigation to SEND AAR error screen", () => {
    const statesThatNavigate = [
      sendAARFlowStates.nfcNotSupportedFinal,
      sendAARFlowStates.ko,
      sendAARFlowStates.cieCanAdvisory
    ];

    sendAarMockStates.forEach(state => {
      const shouldNavigate = statesThatNavigate.includes(
        state.type as (typeof statesThatNavigate)[number]
      );
      it(`should ${
        shouldNavigate ? "" : "not "
      }navigate to the SEND AAR error screen when the state is ${
        state.type
      }`, () => {
        jest
          .spyOn(FLOW_MANAGER, "useSendAarFlowManager")
          .mockImplementation(() => ({
            terminateFlow: jest.fn(),
            goToNextState: jest.fn(),
            currentFlowData: state
          }));
        useIsNfcFeatureAvailableSpy.mockReturnValue(true);

        expect(mockReplace).not.toHaveBeenCalled();

        renderScreen();

        if (shouldNavigate) {
          expect(mockReplace).toHaveBeenCalledTimes(1);
          expect(mockToastHideAll).toHaveBeenCalledTimes(1);
        } else {
          expect(mockReplace).not.toHaveBeenCalled();
          expect(mockToastHideAll).not.toHaveBeenCalled();
        }
      });
    });
  });

  describe("alert behavior", () => {
    it("should show a warning alert on first render", () => {
      expect(mockToastWarning).not.toHaveBeenCalled();
      renderScreen();
      expect(mockToastWarning).toHaveBeenCalledTimes(1);
    });
  });

  describe("snapshot", () => {
    sendAarMockStates.forEach(state => {
      const testName = `should match the snapshot in the ${
        state.type
      } state, displaying 
      ${
        state.type === sendAARFlowStates.notAddressee
          ? "the delegation proposal screen"
          : "a loading screen"
      }`;
      it(testName, async () => {
        jest
          .spyOn(FLOW_MANAGER, "useSendAarFlowManager")
          // eslint-disable-next-line sonarjs/no-identical-functions
          .mockImplementation(() => ({
            terminateFlow: jest.fn(),
            goToNextState: jest.fn(),
            currentFlowData: state
          }));
        const { toJSON, findByTestId } = renderScreen();
        const getLoadingScreen = () => findByTestId("delegationLoading");
        const getDelegationScreen = () => findByTestId("delegationProposal");
        if (state.type === sendAARFlowStates.notAddressee) {
          await expect(getDelegationScreen()).resolves.toBeDefined();
          await expect(getLoadingScreen()).rejects.toThrow();
        } else {
          await expect(getLoadingScreen()).resolves.toBeDefined();
          await expect(getDelegationScreen()).rejects.toThrow();
        }

        expect(toJSON()).toMatchSnapshot();
      });
    });
  });
});

const renderScreen = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  return renderScreenWithNavigationStoreContext(
    SendAarDelegationProposalScreen,
    PN_ROUTES.SEND_AAR_DELEGATION_PROPOSAL,
    {},
    createStore(appReducer, globalState as any)
  );
};
