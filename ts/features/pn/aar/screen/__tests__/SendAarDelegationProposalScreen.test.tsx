import { act, fireEvent } from "@testing-library/react-native";
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
import { SendAarDelegationProposalScreen } from "../SendAarDelegationProposalScreen";
import * as FLOW_MANAGER from "../../hooks/useSendAarFlowManager";

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
          act(() => {
            fireEvent.press(button);
          });
          if (isNfcAvailable) {
            expect(mockPresent).toHaveBeenCalled();
            expect(mockDispatch).not.toHaveBeenCalled();
          } else {
            expect(mockPresent).not.toHaveBeenCalled();
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
    currentStateMockData,
    createStore(appReducer, globalState as any)
  );
};
