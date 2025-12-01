import { createStore } from "redux";
import { act, fireEvent } from "@testing-library/react-native";
import { Alert, BackHandler, BackHandlerStatic } from "react-native";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import PN_ROUTES from "../../../navigation/routes";
import { SendAARCanEducationalScreen } from "../SendAARCanEducationalScreen";
import { setAarFlowState } from "../../store/actions";
import * as AAR_SELECTORS from "../../store/selectors";
import { sendAARFlowStates } from "../../utils/stateUtils";
import { sendAarMockStateFactory } from "../../utils/testUtils";

// `mockPressBack` is available only in the test environment,
// provided by the project's Jest setup (`jestSetup.js`).
export const MockBackHandler = BackHandler as BackHandlerStatic & {
  mockPressBack: () => void;
};

const mockTerminateFlow = jest.fn();
const mockDispatch = jest.fn();

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

describe("SendAARCanEducationalScreen", () => {
  beforeEach(jest.clearAllMocks);

  it("should match the snapshot", () => {
    const component = renderComponent();

    expect(component.toJSON()).toMatchSnapshot();
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

  it("should prompt the system Alert when the hardware back button is pressed", () => {
    const spyOnSystemAlert = jest.spyOn(Alert, "alert");
    renderComponent();

    act(() => {
      MockBackHandler.mockPressBack();
    });

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

  Object.values(sendAarMockStateFactory).forEach(getAarState => {
    const aarState = getAarState();
    const isCieCanAdvisory = aarState.type === sendAARFlowStates.cieCanAdvisory;

    it(`${
      isCieCanAdvisory ? "should" : "should not"
    } dispatch the "setAarFlowState" action when type is: "${
      aarState.type
    }"`, () => {
      jest.spyOn(AAR_SELECTORS, "currentAARFlowData").mockReturnValue(aarState);

      const { getByTestId } = renderComponent();

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
      expect(mockTerminateFlow).not.toHaveBeenCalled();
    });
  });
});

function renderComponent() {
  const baseState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, baseState as any);

  return renderScreenWithNavigationStoreContext<GlobalState>(
    SendAARCanEducationalScreen,
    PN_ROUTES.SEND_AAR_CIE_CAN_EDUCATIONAL,
    {},
    store
  );
}
