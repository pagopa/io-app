import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import * as NFC_HOOK from "../../hooks/useIsNfcFeatureEnabled";
import { SendAarActivateNfcComponent } from "../SendAarActivateNfcComponent";
import * as AAR_SELECTOR from "../../store/selectors";
import {
  sendAarMockStateFactory,
  sendAarMockStates
} from "../../utils/testUtils";
import { setAarFlowState } from "../../store/actions";
import { sendAARFlowStates } from "../../utils/stateUtils";
import {
  trackSendAarMandateCieNfcActivationContinue,
  trackSendAarMandateCieNfcActivationControlAlert,
  trackSendAarMandateCieNfcActivationControlAlertClosure,
  trackSendAarMandateCieNfcActivationControlAlertGoToSettings,
  trackSendAarMandateCieNfcGoToSettings
} from "../../analytics";

const mockDispatch = jest.fn();
const mockOpenNFCSettings = jest.fn();

jest.mock("react-redux", () => ({
  useDispatch: () => mockDispatch,
  useSelector: (selector: () => any) => selector()
}));

jest.mock("@react-navigation/native");

jest.mock("@react-navigation/stack", () => ({
  createStackNavigator: jest.fn()
}));

jest.mock("i18next", () => ({
  t: (path: string) => path
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ bottom: 0 })
}));

jest.mock("../../analytics", () => ({
  trackSendAarMandateCieNfcActivationContinue: jest.fn(),
  trackSendAarMandateCieNfcActivationControlAlert: jest.fn(),
  trackSendAarMandateCieNfcActivationControlAlertClosure: jest.fn(),
  trackSendAarMandateCieNfcActivationControlAlertGoToSettings: jest.fn(),
  trackSendAarMandateCieNfcGoToSettings: jest.fn()
}));

const mockAndroidNfcActivationState =
  sendAarMockStateFactory.androidNFCActivation();

describe("SendAarActivateNfcComponent", () => {
  it("should match the snapshot", () => {
    jest
      .spyOn(AAR_SELECTOR, "currentAARFlowData")
      .mockReturnValue(mockAndroidNfcActivationState);
    const component = render(<SendAarActivateNfcComponent />);

    expect(component.toJSON()).toMatchSnapshot();
  });

  describe.each(sendAarMockStates)(
    'Scenario -> NFC NOT ENABLED with state.type = "$type"',
    aarState => {
      beforeAll(() => {
        jest
          .spyOn(AAR_SELECTOR, "currentAARFlowData")
          .mockReturnValue(aarState);
        jest.spyOn(NFC_HOOK, "useIsNfcFeatureEnabled").mockReturnValue({
          isChecking: false,
          isNfcEnabled: () => Promise.resolve(false),
          openNFCSettings: mockOpenNFCSettings
        });
      });
      afterEach(jest.clearAllMocks);

      it("should invoke the system Alert on continue press and track the corresponding analytics events", async () => {
        const spyOnAlert = jest.spyOn(Alert, "alert");
        const { getByTestId } = render(<SendAarActivateNfcComponent />);

        expect(
          trackSendAarMandateCieNfcActivationContinue
        ).not.toHaveBeenCalled();
        expect(
          trackSendAarMandateCieNfcActivationControlAlert
        ).not.toHaveBeenCalled();

        const secondaryAction = getByTestId("secondaryActionID");

        act(() => {
          fireEvent.press(secondaryAction);
        });

        expect(
          trackSendAarMandateCieNfcActivationContinue
        ).toHaveBeenCalledTimes(1);
        // clear mock
        (trackSendAarMandateCieNfcActivationContinue as jest.Mock).mockClear();

        await waitFor(async () => {
          expect(
            trackSendAarMandateCieNfcActivationControlAlert
          ).toHaveBeenCalledTimes(1);
          expect(spyOnAlert).toHaveBeenCalledTimes(1);

          expect(mockDispatch).not.toHaveBeenCalled();
          expect(mockOpenNFCSettings).not.toHaveBeenCalled();

          const alertTitle = spyOnAlert.mock.calls[0][0];
          const alertMessage = spyOnAlert.mock.calls[0][1];
          const cancelButton = spyOnAlert.mock.calls[0][2]![0];
          const confirmButton = spyOnAlert.mock.calls[0][2]![1];

          expect(alertTitle).toBe(
            "features.pn.aar.flow.androidNfcActivation.alertOnContinue.title"
          );
          expect(alertMessage).toBeUndefined();
          expect(cancelButton.onPress).toBe(
            trackSendAarMandateCieNfcActivationControlAlertClosure
          );
          expect(typeof confirmButton.onPress).toBe("function");
          expect(
            trackSendAarMandateCieNfcActivationControlAlertGoToSettings
          ).not.toHaveBeenCalled();

          act(() => {
            confirmButton.onPress!();
          });

          expect(mockDispatch).not.toHaveBeenCalled();
          expect(
            trackSendAarMandateCieNfcActivationControlAlertClosure
          ).not.toHaveBeenCalled();
          expect(
            trackSendAarMandateCieNfcActivationControlAlertGoToSettings
          ).toHaveBeenCalledTimes(1);
          expect(mockOpenNFCSettings).toHaveBeenCalledTimes(1);

          // clear all mocks
          (
            trackSendAarMandateCieNfcActivationControlAlertGoToSettings as jest.Mock
          ).mockClear();
          (
            trackSendAarMandateCieNfcActivationControlAlert as jest.Mock
          ).mockClear();
          mockOpenNFCSettings.mockClear();

          act(() => {
            cancelButton.onPress!();
          });

          expect(mockDispatch).not.toHaveBeenCalled();
          expect(mockOpenNFCSettings).not.toHaveBeenCalled();
          expect(
            trackSendAarMandateCieNfcActivationControlAlertGoToSettings
          ).not.toHaveBeenCalled();
          expect(
            trackSendAarMandateCieNfcActivationControlAlertClosure
          ).toHaveBeenCalledTimes(1);

          // Ensure "trackSendAarMandateCieNfcActivationContinue" is not re-executed
          expect(
            trackSendAarMandateCieNfcActivationContinue
          ).not.toHaveBeenCalled();
        });
      });
      it(
        'should invoke "mockOpenNFCSettings" upon pressing "Open Settings" and record the corresponding analytics events',
        testOpenNFCSettings
      );
    }
  );
  describe.each(sendAarMockStates)(
    'Scenario -> NFC ENABLED with state.type = "$type"',
    aarState => {
      const isAndroidNFCActivation =
        aarState.type === sendAARFlowStates.androidNFCActivation;

      beforeAll(() => {
        jest
          .spyOn(AAR_SELECTOR, "currentAARFlowData")
          .mockReturnValue(aarState);
        jest.spyOn(NFC_HOOK, "useIsNfcFeatureEnabled").mockReturnValue({
          isChecking: false,
          isNfcEnabled: () => Promise.resolve(true),
          openNFCSettings: mockOpenNFCSettings
        });
      });
      afterEach(jest.clearAllMocks);

      it(`${
        isAndroidNFCActivation ? "should" : "should not"
      } dispatch the update action on continue press and track the corresponding analytics events`, async () => {
        const spyOnAlert = jest.spyOn(Alert, "alert");
        const { getByTestId } = render(<SendAarActivateNfcComponent />);

        const secondaryAction = getByTestId("secondaryActionID");

        act(() => {
          fireEvent.press(secondaryAction);
        });

        await waitFor(async () => {
          expect(spyOnAlert).not.toHaveBeenCalled();
          if (isAndroidNFCActivation) {
            expect(mockDispatch).toHaveBeenCalledTimes(1);
            expect(mockDispatch).toHaveBeenCalledWith(
              setAarFlowState({
                ...mockAndroidNfcActivationState,
                type: sendAARFlowStates.cieScanning
              })
            );
          } else {
            expect(mockDispatch).not.toHaveBeenCalled();
          }

          expect(mockOpenNFCSettings).not.toHaveBeenCalled();
          expect(
            trackSendAarMandateCieNfcActivationContinue
          ).toHaveBeenCalledTimes(1);
          expect(
            trackSendAarMandateCieNfcActivationControlAlert
          ).not.toHaveBeenCalled();
          expect(
            trackSendAarMandateCieNfcActivationControlAlertClosure
          ).not.toHaveBeenCalled();
          expect(
            trackSendAarMandateCieNfcActivationControlAlertGoToSettings
          ).not.toHaveBeenCalled();
        });
      });
      it(
        'should invoke "mockOpenNFCSettings" upon pressing "Open Settings" and record the corresponding analytics events',
        testOpenNFCSettings
      );
    }
  );
});

function testOpenNFCSettings() {
  const spyOnAlert = jest.spyOn(Alert, "alert");
  const { getByTestId } = render(<SendAarActivateNfcComponent />);

  const primaryAction = getByTestId("primaryActionID");

  expect(trackSendAarMandateCieNfcGoToSettings).not.toHaveBeenCalled();

  act(() => {
    fireEvent.press(primaryAction);
  });

  // Expected calls
  expect(trackSendAarMandateCieNfcGoToSettings).toHaveBeenCalledTimes(1);
  expect(mockOpenNFCSettings).toHaveBeenCalledTimes(1);
  // Unexpected calls
  expect(mockDispatch).not.toHaveBeenCalled();
  expect(spyOnAlert).not.toHaveBeenCalled();
  expect(trackSendAarMandateCieNfcActivationContinue).not.toHaveBeenCalled();
  expect(
    trackSendAarMandateCieNfcActivationControlAlert
  ).not.toHaveBeenCalled();
  expect(
    trackSendAarMandateCieNfcActivationControlAlertClosure
  ).not.toHaveBeenCalled();
  expect(
    trackSendAarMandateCieNfcActivationControlAlertGoToSettings
  ).not.toHaveBeenCalled();
}
