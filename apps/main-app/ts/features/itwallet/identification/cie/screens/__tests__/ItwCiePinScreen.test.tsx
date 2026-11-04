import { fireEvent } from "@testing-library/react-native";
import I18n from "i18next";
import { createStore } from "redux";
import { createActor } from "xstate";

import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import { itwEidIssuanceMachine } from "../../../../machine/eid/machine";
import { ItwEidIssuanceMachineContext } from "../../../../machine/eid/provider";
import { testEidIssuanceDeps } from "../../../../machine/utils/testDeps";
import { ITW_ROUTES } from "../../../../navigation/routes";
import { ItwCiePinScreen } from "../ItwCiePinScreen";

const mockSend = jest.fn();

const COMPLETE_PIN = "12345678";
const PARTIAL_PIN = "1234567";

describe("ItwCiePinScreen", () => {
  beforeAll(() => {
    jest
      .spyOn(ItwEidIssuanceMachineContext, "useActorRef")
      .mockReturnValue({ send: mockSend } as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it.each([
    { name: "partial PIN", pin: PARTIAL_PIN },
    { name: "complete PIN", pin: COMPLETE_PIN }
  ])("does not send the PIN when typing a $name", ({ pin }) => {
    const { getByLabelText } = renderComponent();

    fireEvent.changeText(
      getByLabelText(I18n.t("authentication.cie.pin.accessibility.label")),
      pin
    );

    expect(mockSend).not.toHaveBeenCalled();
  });

  it.each([
    { name: "disabled with a partial PIN", pin: PARTIAL_PIN, disabled: true },
    { name: "enabled with a complete PIN", pin: COMPLETE_PIN, disabled: false }
  ])("renders the continue button $name", ({ pin, disabled }) => {
    const { getByLabelText, getByTestId } = renderComponent();

    fireEvent.changeText(
      getByLabelText(I18n.t("authentication.cie.pin.accessibility.label")),
      pin
    );

    expect(
      getByTestId("itwCiePinContinueButtonTestID").props.accessibilityState
    ).toEqual(expect.objectContaining({ disabled }));
  });

  it("sends the PIN when the continue button is pressed", () => {
    const { getByLabelText, getByTestId } = renderComponent();

    fireEvent.changeText(
      getByLabelText(I18n.t("authentication.cie.pin.accessibility.label")),
      COMPLETE_PIN
    );
    fireEvent.press(getByTestId("itwCiePinContinueButtonTestID"));

    expect(mockSend).toHaveBeenCalledWith({
      type: "cie-pin-entered",
      pin: COMPLETE_PIN
    });
  });
});

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const logic = itwEidIssuanceMachine.provide({
    actions: { onInit: jest.fn() }
  });
  const snapshot = createActor(logic, {
    input: { deps: testEidIssuanceDeps() }
  }).getSnapshot();

  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => (
      <ItwEidIssuanceMachineContext.Provider
        logic={logic}
        options={{ snapshot }}
      >
        <ItwCiePinScreen />
      </ItwEidIssuanceMachineContext.Provider>
    ),
    ITW_ROUTES.IDENTIFICATION.CIE.PIN_SCREEN,
    {},
    createStore(appReducer, globalState as any)
  );
};
