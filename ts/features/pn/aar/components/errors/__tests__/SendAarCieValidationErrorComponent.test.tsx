import { act, fireEvent } from "@testing-library/react-native";
import { ComponentType } from "react";
import { createStore } from "redux";
import { Text, View } from "react-native";
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
import * as AAR_SELECTORS from "../../../store/selectors";
import {
  trackSendAarMandateCieErrorRetry,
  trackSendAarMandateCieErrorCac,
  trackSendAarMandateCieErrorClosure,
  trackSendAarMandateCieErrorDetail,
  trackSendAarMandateCieErrorDetailCode,
  trackSendAarMandateCieErrorDetailHelp
} from "../../../analytics";
import { useAarCieErrorBottomSheet } from "../hooks/useAarCieErrorBottomSheet";

const mockTerminateFlow = jest.fn();
const mockSendAarFlowManager = jest.fn();
const mockDispatch = jest.fn();
const mockPresent = jest.fn();

jest.mock("../../../hooks/useSendAarFlowManager", () => ({
  useSendAarFlowManager: () => mockSendAarFlowManager()
}));

jest.mock("../../../../../../store/hooks", () => ({
  ...jest.requireActual("../../../../../../store/hooks"),
  useIODispatch: () => mockDispatch
}));

jest.mock("../../../analytics", () => ({
  trackSendAarMandateCieErrorRetry: jest.fn(),
  trackSendAarMandateCieErrorCac: jest.fn(),
  trackSendAarMandateCieErrorClosure: jest.fn(),
  trackSendAarMandateCieErrorDetail: jest.fn(),
  trackSendAarMandateCieErrorDetailCode: jest.fn(),
  trackSendAarMandateCieErrorDetailHelp: jest.fn()
}));

jest.mock("../hooks/useAarCieErrorBottomSheet");
const mockUseAarCieErrorBottomSheet = useAarCieErrorBottomSheet as jest.Mock<
  ReturnType<typeof useAarCieErrorBottomSheet>,
  Parameters<typeof useAarCieErrorBottomSheet>
>;

const testingCenterUrl = "https://help.center.url";

const assistanceErrorCodes = [
  "CIE_NOT_RELATED_TO_DELEGATOR_ERROR",
  "CIE_EXPIRED_ERROR",
  "PN_MANDATE_BADREQUEST",
  "PN_GENERIC_INVALIDPARAMETER",
  "PN_MANDATE_NOTFOUND",
  "PN_MANDATE_INVALIDVERIFICATIONCODE",
  "ANY_ERROR_CODE",
  undefined
];

describe("SendAarCieValidationErrors", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();

    mockUseAarCieErrorBottomSheet.mockReturnValue({
      bottomSheet: (
        <View>
          <Text>Bottom Sheet content</Text>
        </View>
      ),
      present: mockPresent
    });
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
    it('should call openWebUrl with help center url and "trackSendAarMandateCieErrorCac" on primary action press', () => {
      const { getByTestId } = renderComponent(CieExpiredComponent);
      const primaryActionButton = getByTestId("CieExpiredHelpCenterButton");
      expect(primaryActionButton).toBeDefined();

      act(() => {
        fireEvent.press(primaryActionButton);
      });

      expect(trackSendAarMandateCieErrorCac).toHaveBeenCalledTimes(1);
      expect(openWebUrlSpy).toHaveBeenCalledWith(testingCenterUrl);
      expect(trackSendAarMandateCieErrorClosure).not.toHaveBeenCalled();
    });
    it.each(assistanceErrorCodes)(
      'should call terminateFlow and "trackSendAarMandateCieErrorClosure" with "%s" on secondary action press',
      errorCode => {
        jest
          .spyOn(AAR_SELECTORS, "currentAARFlowStateAssistanceErrorCode")
          .mockReturnValue(errorCode);
        const { getByTestId } = renderComponent(CieExpiredComponent);
        const secondaryActionButton = getByTestId("CieExpiredCloseButton");
        expect(secondaryActionButton).toBeDefined();

        act(() => {
          fireEvent.press(secondaryActionButton);
        });

        expect(trackSendAarMandateCieErrorClosure).toHaveBeenCalledTimes(1);
        expect(trackSendAarMandateCieErrorClosure).toHaveBeenCalledWith(
          errorCode ?? ""
        );
        expect(mockTerminateFlow).toHaveBeenCalled();
        expect(trackSendAarMandateCieErrorCac).not.toHaveBeenCalled();
      }
    );
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

    it.each(assistanceErrorCodes)(
      'should call "trackSendAarMandateCieErrorRetry" with "%s" on retry press',
      errorCode => {
        jest
          .spyOn(AAR_SELECTORS, "currentAARFlowStateAssistanceErrorCode")
          .mockReturnValue(errorCode);
        mockSendAarFlowManager.mockImplementation(() => ({
          currentFlowData: {},
          terminateFlow: jest.fn()
        }));

        const { getByTestId } = renderComponent(UnrelatedCieComponent);
        const retryCta = getByTestId("UnrelatedCieRetryButton");

        act(() => {
          fireEvent.press(retryCta);
        });

        expect(trackSendAarMandateCieErrorRetry).toHaveBeenCalledTimes(1);
        expect(trackSendAarMandateCieErrorRetry).toHaveBeenCalledWith(
          errorCode ?? ""
        );
        expect(trackSendAarMandateCieErrorClosure).not.toHaveBeenCalled();
      }
    );

    it.each(assistanceErrorCodes)(
      'should call "terminateFlow" and call "trackSendAarMandateCieErrorClosure" with "%s" on secondary action press',
      errorCode => {
        jest
          .spyOn(AAR_SELECTORS, "currentAARFlowStateAssistanceErrorCode")
          .mockReturnValue(errorCode);
        mockSendAarFlowManager.mockImplementation(() => ({
          currentFlowData: {},
          terminateFlow: mockTerminateFlow
        }));
        const { getByTestId } = renderComponent(UnrelatedCieComponent);
        const secondaryActionButton = getByTestId("UnrelatedCieCloseButton");
        expect(secondaryActionButton).toBeDefined();

        act(() => {
          fireEvent.press(secondaryActionButton);
        });

        expect(trackSendAarMandateCieErrorClosure).toHaveBeenCalledTimes(1);
        expect(trackSendAarMandateCieErrorClosure).toHaveBeenCalledWith(
          errorCode ?? ""
        );
        expect(mockTerminateFlow).toHaveBeenCalled();
        expect(trackSendAarMandateCieErrorRetry).not.toHaveBeenCalled();
      }
    );
  });

  describe("GenericCieValidationErrorComponent", () => {
    const mockAssistanceErrorCode = "ASSISTANCE_CODE_1234";
    beforeEach(() => {
      jest.spyOn(USE_DEBUGINFO, "useDebugInfo").mockImplementation();
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
    });

    it.each(assistanceErrorCodes)(
      'should call "sendAarErrorSupportBottomSheetComponent" with the correct parameters when errorCode is "%s"',
      errorCode => {
        jest
          .spyOn(AAR_SELECTORS, "currentAARFlowStateAssistanceErrorCode")
          .mockReturnValue(errorCode);

        renderComponent(GenericCieValidationErrorComponent);

        expect(mockUseAarCieErrorBottomSheet).toHaveBeenCalledTimes(1);
        expect(mockUseAarCieErrorBottomSheet).toHaveBeenCalledWith({
          errorName: errorCode,
          zendeskSecondLevelTag: "io_problema_notifica_send_qr_altra_persona",
          onCopyToClipboard: expect.any(Function),
          onStartAssistance: expect.any(Function)
        });
        expect(trackSendAarMandateCieErrorDetailCode).not.toHaveBeenCalled();
        expect(trackSendAarMandateCieErrorDetailHelp).not.toHaveBeenCalled();
      }
    );

    it.each(assistanceErrorCodes)(
      'should call "trackSendAarMandateCieErrorDetailHelp" with "%s"',
      errorCode => {
        jest
          .spyOn(AAR_SELECTORS, "currentAARFlowStateAssistanceErrorCode")
          .mockReturnValue(errorCode);

        renderComponent(GenericCieValidationErrorComponent);

        expect(trackSendAarMandateCieErrorDetailHelp).not.toHaveBeenCalled();

        const { onStartAssistance } =
          mockUseAarCieErrorBottomSheet.mock.calls[0][0];

        act(() => {
          onStartAssistance!(errorCode ?? "");
        });

        expect(trackSendAarMandateCieErrorDetailHelp).toHaveBeenCalledTimes(1);
        expect(trackSendAarMandateCieErrorDetailHelp).toHaveBeenCalledWith(
          errorCode ?? ""
        );
        expect(trackSendAarMandateCieErrorDetailCode).not.toHaveBeenCalled();
      }
    );

    it.each(assistanceErrorCodes)(
      'should call "trackSendAarMandateCieErrorDetailCode" with "%s"',
      errorCode => {
        jest
          .spyOn(AAR_SELECTORS, "currentAARFlowStateAssistanceErrorCode")
          .mockReturnValue(errorCode);

        renderComponent(GenericCieValidationErrorComponent);

        expect(trackSendAarMandateCieErrorDetailCode).not.toHaveBeenCalled();

        const { onCopyToClipboard } =
          mockUseAarCieErrorBottomSheet.mock.calls[0][0];

        act(() => {
          onCopyToClipboard!(errorCode ?? "");
        });

        expect(trackSendAarMandateCieErrorDetailCode).toHaveBeenCalledTimes(1);
        expect(trackSendAarMandateCieErrorDetailCode).toHaveBeenCalledWith(
          errorCode ?? ""
        );
        expect(trackSendAarMandateCieErrorDetailHelp).not.toHaveBeenCalled();
      }
    );

    it.each(assistanceErrorCodes)(
      'should call "present" bottom sheet and "trackSendAarMandateCieErrorDetail" with "%s" on secondary action press',
      errorCode => {
        jest
          .spyOn(AAR_SELECTORS, "currentAARFlowStateAssistanceErrorCode")
          .mockReturnValue(errorCode);

        const { getByTestId } = renderComponent(
          GenericCieValidationErrorComponent
        );
        const secondaryActionButton = getByTestId(
          "GenericCieValidationErrorSupportButton"
        );

        expect(trackSendAarMandateCieErrorDetail).not.toHaveBeenCalled();
        expect(secondaryActionButton).toBeDefined();

        act(() => {
          fireEvent.press(secondaryActionButton);
        });

        expect(trackSendAarMandateCieErrorDetail).toHaveBeenCalledTimes(1);
        expect(trackSendAarMandateCieErrorDetail).toHaveBeenCalledWith(
          errorCode ?? ""
        );
        expect(mockPresent).toHaveBeenCalledTimes(1);

        // Unexpected events
        expect(trackSendAarMandateCieErrorClosure).not.toHaveBeenCalled();
        expect(trackSendAarMandateCieErrorDetailCode).not.toHaveBeenCalled();
        expect(trackSendAarMandateCieErrorDetailHelp).not.toHaveBeenCalled();
      }
    );

    it.each(assistanceErrorCodes)(
      'should call "terminateFlow" and "trackSendAarMandateCieErrorClosure" with "%s" on primary action press',
      errorCode => {
        jest
          .spyOn(AAR_SELECTORS, "currentAARFlowStateAssistanceErrorCode")
          .mockReturnValue(errorCode);
        const { getByTestId } = renderComponent(
          GenericCieValidationErrorComponent
        );
        const primaryActionButton = getByTestId(
          "GenericCieValidationErrorCloseButton"
        );

        expect(mockTerminateFlow).not.toHaveBeenCalled();
        expect(trackSendAarMandateCieErrorClosure).not.toHaveBeenCalled();
        expect(primaryActionButton).toBeDefined();

        act(() => {
          fireEvent.press(primaryActionButton);
        });

        expect(mockTerminateFlow).toHaveBeenCalled();
        expect(trackSendAarMandateCieErrorClosure).toHaveBeenCalledTimes(1);
        expect(trackSendAarMandateCieErrorClosure).toHaveBeenCalledWith(
          errorCode ?? ""
        );

        // Unexpected events
        expect(trackSendAarMandateCieErrorDetailCode).not.toHaveBeenCalled();
        expect(trackSendAarMandateCieErrorDetailHelp).not.toHaveBeenCalled();
        expect(trackSendAarMandateCieErrorDetail).not.toHaveBeenCalled();
      }
    );
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
