import { createStore } from "redux";
import { Alert } from "react-native";
import { act, fireEvent } from "@testing-library/react-native";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import PN_ROUTES from "../../../navigation/routes";
import {
  SendAarActivateNfcScreen,
  SendAarActivateNfcScreenProps
} from "../SendAarActivateNfcScreen";
import { sendAarMockStates } from "../../utils/testUtils";
import { sendAARFlowStates } from "../../utils/stateUtils";
import * as AAR_SELECTORS from "../../store/selectors";
import { MESSAGES_ROUTES } from "../../../../messages/navigation/routes";
import {
  trackSendAarMandateCieReadingClosureAlert,
  trackSendAarMandateCieReadingClosureAlertAccepted,
  trackSendAarMandateCieReadingClosureAlertContinue
} from "../../analytics";

const mockReplace = jest.fn();
const mockTerminateFlow = jest.fn();

jest.mock("../../analytics", () => ({
  trackSendAarMandateCieReadingClosureAlert: jest.fn(),
  trackSendAarMandateCieReadingClosureAlertAccepted: jest.fn(),
  trackSendAarMandateCieReadingClosureAlertContinue: jest.fn()
}));

jest.mock("i18next", () => ({
  t: (path: string) => path
}));

jest.mock("../../hooks/useSendAarFlowManager", () => ({
  useSendAarFlowManager: () => ({
    terminateFlow: mockTerminateFlow
  })
}));

describe("SendAarActivateNfcScreen", () => {
  afterEach(jest.clearAllMocks);

  it("should match the snapshot", () => {
    const component = renderComponent();

    expect(component.toJSON()).toMatchSnapshot();
  });

  sendAarMockStates.forEach(aarState => {
    const isCieScanning = aarState.type === sendAARFlowStates.cieScanning;

    it(`${
      isCieScanning ? "should" : "should not"
    } invoke "navigation.replace" for state.type = "${aarState.type}"`, () => {
      jest.spyOn(AAR_SELECTORS, "currentAARFlowData").mockReturnValue(aarState);
      const spyOnAlert = jest.spyOn(Alert, "alert");

      renderComponent();

      if (isCieScanning) {
        const { type: _, ...params } = aarState;

        expect(mockReplace).toHaveBeenCalledTimes(1);
        expect(mockReplace).toHaveBeenCalledWith(
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
        expect(mockReplace).not.toHaveBeenCalled();
      }
      expect(spyOnAlert).not.toHaveBeenCalled();
    });
  });

  it('should prompt the system Alert and invoke "trackSendAarMandateCieReadingClosureAlert" when the close button is pressed', () => {
    const spyOnAlert = jest.spyOn(Alert, "alert");

    const { getByTestId } = renderComponent();

    const closeAction = getByTestId("closeActionID");

    expect(trackSendAarMandateCieReadingClosureAlert).not.toHaveBeenCalled();
    expect(spyOnAlert).not.toHaveBeenCalled();

    act(() => {
      fireEvent.press(closeAction);
    });

    expect(trackSendAarMandateCieReadingClosureAlert).toHaveBeenCalledTimes(1);
    expect(trackSendAarMandateCieReadingClosureAlert).toHaveBeenCalledWith(
      "NFC_ACTIVATION"
    );
    expect(spyOnAlert).toHaveBeenCalledTimes(1);
    expect(spyOnAlert).toHaveBeenCalledWith(
      "features.pn.aar.flow.androidNfcActivation.alertOnClose.title",
      "features.pn.aar.flow.androidNfcActivation.alertOnClose.message",
      [
        {
          text: "features.pn.aar.flow.androidNfcActivation.alertOnClose.confirm",
          style: "destructive",
          onPress: expect.any(Function)
        },
        {
          text: "features.pn.aar.flow.androidNfcActivation.alertOnClose.cancel",
          onPress: expect.any(Function)
        }
      ]
    );
  });

  it('should invoke "terminateFlow" and "trackSendAarMandateCieReadingClosureAlertAccepted" when the Alert confirm button is pressed', () => {
    const spyOnAlert = jest.spyOn(Alert, "alert");
    const { getByTestId } = renderComponent();

    const closeAction = getByTestId("closeActionID");

    act(() => {
      fireEvent.press(closeAction);
    });

    expect(mockTerminateFlow).not.toHaveBeenCalled();
    expect(
      trackSendAarMandateCieReadingClosureAlertAccepted
    ).not.toHaveBeenCalled();

    const confirmAction = spyOnAlert.mock.calls[0][2]?.[0];

    act(() => {
      confirmAction?.onPress?.();
    });

    expect(mockTerminateFlow).toHaveBeenCalledTimes(1);
    expect(
      trackSendAarMandateCieReadingClosureAlertAccepted
    ).toHaveBeenCalledTimes(1);
    expect(
      trackSendAarMandateCieReadingClosureAlertAccepted
    ).toHaveBeenCalledWith("NFC_ACTIVATION");
    expect(
      trackSendAarMandateCieReadingClosureAlertContinue
    ).not.toHaveBeenCalled();
  });

  it('should invoke "trackSendAarMandateCieReadingClosureAlertContinue" when the Alert cancel button is pressed', () => {
    const spyOnAlert = jest.spyOn(Alert, "alert");
    const { getByTestId } = renderComponent();

    const closeAction = getByTestId("closeActionID");

    act(() => {
      fireEvent.press(closeAction);
    });

    expect(
      trackSendAarMandateCieReadingClosureAlertContinue
    ).not.toHaveBeenCalled();

    const confirmAction = spyOnAlert.mock.calls[0][2]?.[1];

    act(() => {
      confirmAction?.onPress?.();
    });

    expect(
      trackSendAarMandateCieReadingClosureAlertContinue
    ).toHaveBeenCalledTimes(1);
    expect(
      trackSendAarMandateCieReadingClosureAlertContinue
    ).toHaveBeenCalledWith("NFC_ACTIVATION");
    expect(
      trackSendAarMandateCieReadingClosureAlertAccepted
    ).not.toHaveBeenCalled();
    expect(mockTerminateFlow).not.toHaveBeenCalled();
  });
});

function renderComponent() {
  const baseState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, baseState as any);

  return renderScreenWithNavigationStoreContext<GlobalState>(
    ({ navigation, route }: SendAarActivateNfcScreenProps) => (
      <SendAarActivateNfcScreen
        route={route}
        navigation={{ ...navigation, replace: mockReplace }}
      />
    ),
    PN_ROUTES.SEND_AAR_NFC_ACTIVATION,
    {},
    store
  );
}
