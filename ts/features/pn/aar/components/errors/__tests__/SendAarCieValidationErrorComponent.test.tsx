import { fireEvent } from "@testing-library/react-native";
import { ComponentType } from "react";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import * as REMOTE_CONFIG from "../../../../../../store/reducers/backendStatus/remoteConfig";
import { GlobalState } from "../../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import * as URL_UTILS from "../../../../../../utils/url";
import PN_ROUTES from "../../../../navigation/routes";
import {
  CieExpiredComponent,
  GenericCieValidationErrorComponent,
  UnrelatedCieComponent
} from "../SendAarCieValidationErrorComponent";
import { sendAarMockStateFactory } from "../../../utils/testUtils";
import { setAarFlowState } from "../../../store/actions";
import { AarStatesByName, sendAARFlowStates } from "../../../utils/stateUtils";
import * as USE_DEBUGINFO from "../../../../../../hooks/useDebugInfo";
import * as USE_BOTTOMSHEET from "../../../../../../utils/hooks/bottomSheet";
import * as AAR_SELECTORS from "../../../store/selectors";

const mockTerminateFlow = jest.fn();
const mockSendAarFlowManager = jest.fn();
const mockDispatch = jest.fn();

jest.mock("../../../hooks/useSendAarFlowManager", () => ({
  useSendAarFlowManager: () => mockSendAarFlowManager()
}));
jest.mock("../../../../../../store/hooks", () => ({
  ...jest.requireActual("../../../../../../store/hooks"),
  useIODispatch: () => mockDispatch
}));

const testingCenterUrl = "https://help.center.url";

describe("SendAarCieValidationErrors", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });
  describe("CieExpiredComponent", () => {
    const openWebUrlSpy = jest.fn();

    beforeEach(() => {
      jest
        .spyOn(REMOTE_CONFIG, "sendAarInAppDelegationUrlSelector")
        .mockImplementation(() => testingCenterUrl);
      mockSendAarFlowManager.mockImplementation(() => ({
        terminateFlow: mockTerminateFlow
      }));
      jest.spyOn(URL_UTILS, "openWebUrl").mockImplementation(openWebUrlSpy);
    });
    it("should match snapshot", () => {
      const { toJSON, getByTestId } = renderComponent(CieExpiredComponent);
      const component = getByTestId("CieExpiredErrorComponent");
      expect(toJSON()).toMatchSnapshot();
      expect(component).toBeDefined();
    });
    it("should call openWebUrl with help center url on primary action press", () => {
      const { getByTestId } = renderComponent(CieExpiredComponent);
      const primaryActionButton = getByTestId("CieExpiredHelpCenterButton");
      expect(primaryActionButton).toBeDefined();
      fireEvent.press(primaryActionButton);
      expect(openWebUrlSpy).toHaveBeenCalledWith(testingCenterUrl);
    });
    it("should call terminateFlow on secondary action press", () => {
      const { getByTestId } = renderComponent(CieExpiredComponent);
      const secondaryActionButton = getByTestId("CieExpiredCloseButton");
      expect(secondaryActionButton).toBeDefined();
      fireEvent.press(secondaryActionButton);
      expect(mockTerminateFlow).toHaveBeenCalled();
    });
  });
  // eslint-disable-next-line sonarjs/cognitive-complexity
  describe("UnrelatedCieComponent", () => {
    it("should match snapshot", () => {
      mockSendAarFlowManager.mockImplementation(() => ({
        currentFlowData: {},
        terminateFlow: mockTerminateFlow
      }));

      const { toJSON, getByTestId } = renderComponent(UnrelatedCieComponent);
      const component = getByTestId("UnrelatedCieErrorComponent");
      expect(component).toBeDefined();
      expect(toJSON()).toMatchSnapshot();
    });
    [true, false].forEach(isPreviousStateCorrect => {
      [true, false].forEach(isCurrentStateCorrect => {
        const previousState = isPreviousStateCorrect
          ? sendAarMockStateFactory.validatingMandate()
          : sendAarMockStateFactory.cieScanning();

        const currentFlowData = isCurrentStateCorrect
          ? { ...sendAarMockStateFactory.ko(), previousState }
          : sendAarMockStateFactory.cieCanAdvisory();
        it(`should ${
          isPreviousStateCorrect && isCurrentStateCorrect ? "" : "not "
        }dispatch a retry action on primary action press, when the previous state ${
          isPreviousStateCorrect ? "is" : "isn't"
        } "validatingMandate" and the current state ${
          isCurrentStateCorrect ? "is" : "isn't"
        } "ko"`, () => {
          mockSendAarFlowManager.mockImplementation(() => ({
            currentFlowData,
            terminateFlow: mockTerminateFlow
          }));
          const { getByTestId } = renderComponent(UnrelatedCieComponent);
          const primaryActionButton = getByTestId("UnrelatedCieRetryButton");
          expect(primaryActionButton).toBeDefined();
          fireEvent.press(primaryActionButton);

          if (!isCurrentStateCorrect) {
            expect(mockDispatch).not.toHaveBeenCalled();
            return;
          }

          if (isPreviousStateCorrect) {
            const { iun, mandateId, recipientInfo, unsignedVerificationCode } =
              previousState as AarStatesByName["validatingMandate"];
            expect(mockDispatch).toHaveBeenCalledTimes(1);
            expect(mockDispatch).toHaveBeenCalledWith(
              setAarFlowState({
                type: sendAARFlowStates.cieCanAdvisory,
                iun,
                mandateId,
                recipientInfo,
                verificationCode: unsignedVerificationCode
              })
            );
          } else {
            expect(mockDispatch).not.toHaveBeenCalled();
          }
        });
      });
    });
    it("should call terminateFlow on secondary action press", () => {
      mockSendAarFlowManager.mockImplementation(() => ({
        currentFlowData: {},
        terminateFlow: mockTerminateFlow
      }));
      const { getByTestId } = renderComponent(UnrelatedCieComponent);
      const secondaryActionButton = getByTestId("UnrelatedCieCloseButton");
      expect(secondaryActionButton).toBeDefined();
      fireEvent.press(secondaryActionButton);
      expect(mockTerminateFlow).toHaveBeenCalled();
    });
  });

  describe("GenericCieValidationErrorComponent", () => {
    const mockBottomSheetPresent = jest.fn();
    const mockBottomSheet = () => <></>;
    const mockBottomSheetDismiss = jest.fn();
    const mockUseBottomSheet = jest.fn().mockReturnValue({
      present: mockBottomSheetPresent,
      dismiss: mockBottomSheetDismiss,
      bottomSheet: mockBottomSheet
    });
    const mockAssistanceErrorCode = "ASSISTANCE_CODE_1234";
    beforeEach(() => {
      jest.spyOn(USE_DEBUGINFO, "useDebugInfo").mockImplementation();
      jest
        .spyOn(USE_BOTTOMSHEET, "useIOBottomSheetModal")
        .mockImplementation(mockUseBottomSheet);
      jest
        .spyOn(AAR_SELECTORS, "currentAARFlowStateErrorDebugInfoSelector")
        .mockImplementation();
      jest
        .spyOn(AAR_SELECTORS, "currentAARFlowStateAssistanceErrorCode")
        .mockImplementation(() => mockAssistanceErrorCode);
      mockSendAarFlowManager.mockImplementation(() => ({
        terminateFlow: mockTerminateFlow
      }));
    });
    it("should match snapshot", () => {
      const { toJSON, getByTestId } = renderComponent(
        GenericCieValidationErrorComponent
      );
      const component = getByTestId("GenericCieValidationErrorComponent");
      expect(component).toBeDefined();
      expect(toJSON()).toMatchSnapshot();
      expect(mockBottomSheetPresent).not.toHaveBeenCalled();
    });
    it("should call present bottom sheet on secondary action press", () => {
      const { getByTestId } = renderComponent(
        GenericCieValidationErrorComponent
      );
      const secondaryActionButton = getByTestId(
        "GenericCieValidationErrorSupportButton"
      );
      expect(mockBottomSheetPresent).not.toHaveBeenCalled();
      expect(secondaryActionButton).toBeDefined();
      fireEvent.press(secondaryActionButton);
      expect(mockBottomSheetPresent).toHaveBeenCalled();
    });
    it("should call terminateFlow on primary action press", () => {
      const { getByTestId } = renderComponent(
        GenericCieValidationErrorComponent
      );
      const primaryActionButton = getByTestId(
        "GenericCieValidationErrorCloseButton"
      );
      expect(mockTerminateFlow).not.toHaveBeenCalled();
      expect(primaryActionButton).toBeDefined();
      fireEvent.press(primaryActionButton);
      expect(mockTerminateFlow).toHaveBeenCalled();
    });
  });
});

const renderComponent = (Component: ComponentType) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => <Component />,
    PN_ROUTES.QR_SCAN_FLOW,
    {},
    createStore(appReducer, globalState as any)
  );
};
