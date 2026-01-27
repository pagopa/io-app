import { createStore } from "redux";
import { act, fireEvent, waitFor } from "@testing-library/react-native";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import PN_ROUTES from "../../../navigation/routes";
import {
  SendAarCieCardReadingEducationalScreen,
  SendAarCieCardReadingEducationalScreenProps
} from "../SendAarCieCardReadingEducationalScreen";
import { setAarFlowState } from "../../store/actions";
import * as AAR_SELECTORS from "../../store/selectors";
import { sendAARFlowStates } from "../../utils/stateUtils";
import {
  sendAarMockStateFactory,
  sendAarMockStates
} from "../../utils/testUtils";
import { MESSAGES_ROUTES } from "../../../../messages/navigation/routes";
import * as USE_HARDWARE_BACK_BUTTON from "../../../../../hooks/useHardwareBackButton";
import * as NFC_HOOK from "../../hooks/useIsNfcFeatureEnabled";
import {
  trackSendAarMandateCieCardReadingDisclaimer,
  trackSendAarMandateCieCardReadingDisclaimerContinue
} from "../../analytics";

const mockNavigate = jest.fn();
const mockReplace = jest.fn();
const mockGoBack = jest.fn();
const mockDispatch = jest.fn();

const mockCieScanningAdvisoryState =
  sendAarMockStateFactory.cieScanningAdvisory();
const sendAarStatesWithoutCieScanningAdvisory = sendAarMockStates.filter(
  ({ type }) => type !== mockCieScanningAdvisoryState.type
);

jest.mock("../../analytics", () => ({
  trackSendAarMandateCieCardReadingDisclaimer: jest.fn(),
  trackSendAarMandateCieCardReadingDisclaimerContinue: jest.fn()
}));
jest.mock("../../../../../store/hooks", () => ({
  ...jest.requireActual("../../../../../store/hooks"),
  useIODispatch: () => mockDispatch
}));

jest.mock("i18next", () => ({
  t: (path: string) => path
}));

describe("SendAarCieCardReadingEducationalScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest
      .spyOn(AAR_SELECTORS, "currentAARFlowData")
      .mockReturnValue(mockCieScanningAdvisoryState);
    jest
      .spyOn(AAR_SELECTORS, "aarAdresseeDenominationSelector")
      .mockReturnValue(mockCieScanningAdvisoryState.recipientInfo.denomination);
  });

  it("should match the snapshot", () => {
    const component = renderComponent();

    expect(component.toJSON()).toMatchSnapshot();
  });

  it('should invoke "trackSendAarMandateCieCardReadingDisclaimer" when component is focused', async () => {
    renderComponent();

    await waitFor(() => {
      expect(trackSendAarMandateCieCardReadingDisclaimer).toHaveBeenCalledTimes(
        1
      );
    });
  });

  it("should dispatch the right state update action and navigate back when the back button is pressed", () => {
    const { getByLabelText } = renderComponent();

    const backButton = getByLabelText("global.buttons.back");

    expect(mockDispatch).not.toHaveBeenCalled();
    expect(mockGoBack).not.toHaveBeenCalled();

    act(() => {
      fireEvent.press(backButton);
    });

    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith(
      setAarFlowState({
        ...mockCieScanningAdvisoryState,
        type: sendAARFlowStates.cieCanInsertion
      })
    );
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("should dispatch the right state update action and navigate back when the hardware back button is pressed", () => {
    const spyOnUseHardwareBackButton = jest.spyOn(
      USE_HARDWARE_BACK_BUTTON,
      "useHardwareBackButtonWhenFocused"
    );

    renderComponent();

    const hardwareBackButtonCb = spyOnUseHardwareBackButton.mock.calls[0][0];

    expect(mockDispatch).not.toHaveBeenCalled();
    expect(mockGoBack).not.toHaveBeenCalled();

    act(() => {
      hardwareBackButtonCb();
    });

    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith(
      setAarFlowState({
        ...mockCieScanningAdvisoryState,
        type: sendAARFlowStates.cieCanInsertion
      })
    );
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it.each([true, false])(
    'should invoke "trackSendAarMandateCieCardReadingDisclaimerContinue" and dispatch the right state update action when the primary action is clicked (NFC enabled -> "%s")',
    async nfcEnabled => {
      jest.spyOn(NFC_HOOK, "useIsNfcFeatureEnabled").mockReturnValue({
        isChecking: false,
        openNFCSettings: jest.fn(),
        isNfcEnabled: () => Promise.resolve(nfcEnabled)
      });
      const { getByTestId } = renderComponent();

      const primaryAction = getByTestId("primaryActionID");

      expect(mockDispatch).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(
        trackSendAarMandateCieCardReadingDisclaimerContinue
      ).not.toHaveBeenCalled();

      act(() => {
        fireEvent.press(primaryAction);
      });

      expect(
        trackSendAarMandateCieCardReadingDisclaimerContinue
      ).toHaveBeenCalledTimes(1);
      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledTimes(1);
        expect(mockDispatch).toHaveBeenCalledWith(
          setAarFlowState({
            ...mockCieScanningAdvisoryState,
            type: nfcEnabled
              ? sendAARFlowStates.cieScanning
              : sendAARFlowStates.androidNFCActivation
          })
        );
        expect(mockGoBack).not.toHaveBeenCalled();
      });
    }
  );

  it.each(sendAarStatesWithoutCieScanningAdvisory)(
    'should not update the aar state when the back button is pressed for the type: "$type"',
    currentAarState => {
      jest
        .spyOn(AAR_SELECTORS, "currentAARFlowData")
        .mockReturnValue(currentAarState);

      const { getByLabelText } = renderComponent();

      const backButton = getByLabelText("global.buttons.back");

      act(() => {
        fireEvent.press(backButton);
      });

      expect(mockDispatch).not.toHaveBeenCalled();
    }
  );

  it.each(sendAarStatesWithoutCieScanningAdvisory)(
    'should not update the aar state when the hardware back button is pressed for the type: "$type"',
    currentAarState => {
      jest
        .spyOn(AAR_SELECTORS, "currentAARFlowData")
        .mockReturnValue(currentAarState);
      const spyOnUseHardwareBackButton = jest.spyOn(
        USE_HARDWARE_BACK_BUTTON,
        "useHardwareBackButtonWhenFocused"
      );

      renderComponent();

      const hardwareBackButtonCb = spyOnUseHardwareBackButton.mock.calls[0][0];

      act(() => {
        hardwareBackButtonCb();
      });

      expect(mockDispatch).not.toHaveBeenCalled();
    }
  );

  it.each(sendAarStatesWithoutCieScanningAdvisory)(
    'should not update the aar state when the primary action is pressed for type: "$type"',
    currentAarState => {
      jest
        .spyOn(AAR_SELECTORS, "currentAARFlowData")
        .mockReturnValue(currentAarState);
      const { getByTestId } = renderComponent();

      const primaryAction = getByTestId("primaryActionID");

      act(() => {
        fireEvent.press(primaryAction);
      });

      expect(mockDispatch).not.toHaveBeenCalled();
    }
  );

  sendAarMockStates.forEach(currentAarState => {
    const isCieScanning =
      currentAarState.type === sendAARFlowStates.cieScanning;
    it(`${
      isCieScanning ? "should" : "should not"
    } navigate into the "SEND_AAR_CIE_CARD_READING" route when type is "${
      currentAarState.type
    }"`, () => {
      jest
        .spyOn(AAR_SELECTORS, "currentAARFlowData")
        .mockReturnValue(currentAarState);
      renderComponent();

      if (isCieScanning) {
        const { type: _, ...params } = currentAarState;

        expect(mockNavigate).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith(
          MESSAGES_ROUTES.MESSAGES_NAVIGATOR,
          {
            screen: PN_ROUTES.MAIN,
            params: {
              screen: PN_ROUTES.SEND_AAR_CIE_CARD_READING,
              params
            }
          }
        );
      } else {
        expect(mockNavigate).not.toHaveBeenCalled();
      }
      expect(mockDispatch).not.toHaveBeenCalled();
    });
  });
  sendAarMockStates.forEach(currentAarState => {
    const isCieCanInsertion =
      currentAarState.type === sendAARFlowStates.cieCanInsertion;
    it(`${
      isCieCanInsertion ? "should" : "should not"
    } navigate back when type is "${currentAarState.type}"`, () => {
      jest
        .spyOn(AAR_SELECTORS, "currentAARFlowData")
        .mockReturnValue(currentAarState);
      renderComponent();

      if (isCieCanInsertion) {
        expect(mockGoBack).toHaveBeenCalledTimes(1);
      } else {
        expect(mockGoBack).not.toHaveBeenCalled();
      }
      expect(mockDispatch).not.toHaveBeenCalled();
    });
  });
  sendAarMockStates.forEach(currentAarState => {
    const isAndroidNfcActivation =
      currentAarState.type === sendAARFlowStates.androidNFCActivation;
    it(`${
      isAndroidNfcActivation ? "should" : "should not"
    } invoke replace when type is "${currentAarState.type}"`, () => {
      jest
        .spyOn(AAR_SELECTORS, "currentAARFlowData")
        .mockReturnValue(currentAarState);
      renderComponent();

      if (isAndroidNfcActivation) {
        expect(mockReplace).toHaveBeenCalledTimes(1);
        expect(mockReplace).toHaveBeenCalledWith(
          MESSAGES_ROUTES.MESSAGES_NAVIGATOR,
          {
            screen: PN_ROUTES.MAIN,
            params: {
              screen: PN_ROUTES.SEND_AAR_NFC_ACTIVATION
            }
          }
        );
      } else {
        expect(mockReplace).not.toHaveBeenCalled();
      }
      expect(mockDispatch).not.toHaveBeenCalled();
    });
  });
});

function renderComponent() {
  const baseState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, baseState as any);

  return renderScreenWithNavigationStoreContext<GlobalState>(
    ({ navigation, route }: SendAarCieCardReadingEducationalScreenProps) => (
      <SendAarCieCardReadingEducationalScreen
        route={route}
        navigation={{
          ...navigation,
          replace: mockReplace,
          navigate: mockNavigate,
          goBack: mockGoBack
        }}
      />
    ),
    PN_ROUTES.SEND_AAR_CIE_CARD_READING_EDUCATIONAL,
    {},
    store
  );
}
