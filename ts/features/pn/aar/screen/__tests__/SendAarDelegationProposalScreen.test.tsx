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
const mockBottomSheet = (_name: string) => ({
  bottomSheet: <></>,
  present: mockPresent,
  dismiss: jest.fn()
});
const mockToastWarning = jest.fn();

jest.mock("@pagopa/io-app-design-system", () => ({
  ...jest.requireActual("@pagopa/io-app-design-system"),
  useIOToast: () => ({
    show: (_message: string, _options?: unknown) => jest.fn(),
    error: jest.fn(),
    warning: mockToastWarning,
    success: jest.fn(),
    info: (_message: string) => jest.fn(),
    hideAll: () => jest.fn(),
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

  describe("CTA press behavior", () => {
    [true, false].forEach(isNfcAvailable => {
      it(`behaves correctly on button press when the NFC feature ${
        isNfcAvailable ? "is" : "isn't"
      } available`, () => {
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

  describe("navigation to SEND AAR error screen", () => {
    sendAarMockStates.forEach(state => {
      const shouldNavigate =
        state.type === sendAARFlowStates.nfcNotSupportedFinal;
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
        } else {
          expect(mockReplace).not.toHaveBeenCalled();
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
    it("should match the snapshot", () => {
      const { toJSON } = renderScreen();
      expect(toJSON()).toMatchSnapshot();
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
