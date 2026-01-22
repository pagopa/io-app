import { createStore } from "redux";
import { act, fireEvent } from "@testing-library/react-native";
import { Alert } from "react-native";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import PN_ROUTES from "../../../navigation/routes";
import {
  SendAarCanEducationalScreen,
  SendAarCanEducationalScreenProps
} from "../SendAarCanEducationalScreen";
import { setAarFlowState } from "../../store/actions";
import * as AAR_SELECTORS from "../../store/selectors";
import { sendAARFlowStates } from "../../utils/stateUtils";
import { sendAarMockStates } from "../../utils/testUtils";
import { MESSAGES_ROUTES } from "../../../../messages/navigation/routes";
import {
  trackSendAarMandateCiePreparation,
  trackSendAarMandateCiePreparationContinue
} from "../../analytics";

const mockNavigate = jest.fn();

const mockTerminateFlow = jest.fn();
const mockDispatch = jest.fn();

jest.mock("../../analytics", () => ({
  trackSendAarMandateCiePreparation: jest.fn(),
  trackSendAarMandateCiePreparationContinue: jest.fn()
}));

jest.mock("../../../../../store/hooks", () => ({
  ...jest.requireActual("../../../../../store/hooks"),
  useIODispatch: () => mockDispatch
}));
jest.mock("../../hooks/useSendAarFlowManager", () => ({
  ...jest.requireActual("../../hooks/useSendAarFlowManager"),
  useSendAarFlowManager: () => ({ terminateFlow: mockTerminateFlow })
}));

jest.mock("i18next", () => ({
  t: (path: string) => path
}));

describe("SendAarCanEducationalScreen", () => {
  beforeEach(jest.clearAllMocks);

  it("should match the snapshot", () => {
    const component = renderComponent();

    expect(component.toJSON()).toMatchSnapshot();
  });

  it('should track "trackSendAarMandateCiePreparation" on component mount', () => {
    renderComponent();

    expect(trackSendAarMandateCiePreparation).toHaveBeenCalledTimes(1);
    expect(trackSendAarMandateCiePreparationContinue).not.toHaveBeenCalled();
  });

  it("should prompt the system Alert when the back button is pressed", () => {
    const spyOnSystemAlert = jest.spyOn(Alert, "alert");
    const { getByLabelText } = renderComponent();

    const backButton = getByLabelText("global.buttons.back");

    fireEvent.press(backButton);

    expect(spyOnSystemAlert).toHaveBeenCalledTimes(1);
    expect(spyOnSystemAlert).toHaveBeenCalledWith(
      "features.pn.aar.flow.cieCanAdvisory.alert.title",
      "features.pn.aar.flow.cieCanAdvisory.alert.message",
      [
        {
          text: "features.pn.aar.flow.cieCanAdvisory.alert.confirm",
          style: "destructive",
          onPress: expect.any(Function)
        },
        {
          text: "features.pn.aar.flow.cieCanAdvisory.alert.cancel"
        }
      ]
    );

    expect(mockTerminateFlow).not.toHaveBeenCalled();
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('should invoke "terminateFlow" when the Alert confirm button is pressed', () => {
    const spyOnSystemAlert = jest.spyOn(Alert, "alert");
    const { getByLabelText } = renderComponent();

    const backButton = getByLabelText("global.buttons.back");

    fireEvent.press(backButton);

    expect(mockTerminateFlow).not.toHaveBeenCalled();

    const confirmAction = spyOnSystemAlert.mock.calls[0][2]?.[0];

    act(() => {
      confirmAction?.onPress?.();
    });

    expect(mockTerminateFlow).toHaveBeenCalledTimes(1);
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('should not invoke "terminateFlow" when the Alert cancel button is pressed', () => {
    const spyOnSystemAlert = jest.spyOn(Alert, "alert");
    const { getByLabelText } = renderComponent();

    const backButton = getByLabelText("global.buttons.back");

    fireEvent.press(backButton);

    const cancelAction = spyOnSystemAlert.mock.calls[0][2]?.[1];

    act(() => {
      cancelAction?.onPress?.();
    });

    expect(mockTerminateFlow).not.toHaveBeenCalled();
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  describe.each(sendAarMockStates)('AAR state: "$type"', aarState => {
    beforeEach(() => {
      jest.spyOn(AAR_SELECTORS, "currentAARFlowData").mockReturnValue(aarState);
    });

    const isCieCanAdvisory = aarState.type === sendAARFlowStates.cieCanAdvisory;
    const isCieCanInsertion =
      aarState.type === sendAARFlowStates.cieCanInsertion;

    it(`${
      isCieCanAdvisory ? "should" : "should not"
    } dispatch the "setAarFlowState" action`, () => {
      const { getByTestId } = renderComponent();

      expect(trackSendAarMandateCiePreparationContinue).not.toHaveBeenCalled();

      const continueCTA = getByTestId("primaryActionID");

      fireEvent.press(continueCTA);

      if (isCieCanAdvisory) {
        expect(mockDispatch).toHaveBeenCalledTimes(1);
        expect(mockDispatch).toHaveBeenCalledWith(
          setAarFlowState({
            ...aarState,
            type: sendAARFlowStates.cieCanInsertion
          })
        );
      } else {
        expect(mockDispatch).not.toHaveBeenCalled();
      }

      expect(trackSendAarMandateCiePreparationContinue).toHaveBeenCalledTimes(
        1
      );
      expect(mockTerminateFlow).not.toHaveBeenCalled();
    });

    it(`${
      isCieCanInsertion ? "should" : "should not"
    } navigate into the "SendAARCieCanInsertionScreen"`, () => {
      renderComponent();

      if (isCieCanInsertion) {
        expect(mockNavigate).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith(
          MESSAGES_ROUTES.MESSAGES_NAVIGATOR,
          {
            screen: PN_ROUTES.MAIN,
            params: {
              screen: PN_ROUTES.SEND_AAR_CIE_CAN_INSERTION
            }
          }
        );
      } else {
        expect(mockNavigate).not.toHaveBeenCalled();
      }
    });
  });
});

function renderComponent() {
  const baseState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, baseState as any);

  return renderScreenWithNavigationStoreContext<GlobalState>(
    ({ navigation, route }: SendAarCanEducationalScreenProps) => (
      <SendAarCanEducationalScreen
        route={route}
        navigation={{ ...navigation, navigate: mockNavigate }}
      />
    ),
    PN_ROUTES.SEND_AAR_CIE_CAN_EDUCATIONAL,
    {},
    store
  );
}
