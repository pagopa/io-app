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
import { ItwCieCanScreen } from "../ItwCieCanScreen";

const mockSend = jest.fn();

const COMPLETE_CAN = "123456";
const PARTIAL_CAN = "12345";

describe("ItwCieCanScreen", () => {
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
    { name: "partial CAN", can: PARTIAL_CAN },
    { name: "complete CAN", can: COMPLETE_CAN }
  ])("does not send the CAN when typing a $name", ({ can }) => {
    const { getByLabelText } = renderComponent();

    fireEvent.changeText(
      getByLabelText(I18n.t("authentication.cie.pin.accessibility.label")),
      can
    );

    expect(mockSend).not.toHaveBeenCalled();
  });

  it.each([
    { name: "disabled with a partial CAN", can: PARTIAL_CAN, disabled: true },
    { name: "enabled with a complete CAN", can: COMPLETE_CAN, disabled: false }
  ])("renders the confirm button $name", ({ can, disabled }) => {
    const { getByLabelText, getByTestId } = renderComponent();

    fireEvent.changeText(
      getByLabelText(I18n.t("authentication.cie.pin.accessibility.label")),
      can
    );

    expect(
      getByTestId("itwCieCanConfirmButtonTestID").props.accessibilityState
    ).toEqual(expect.objectContaining({ disabled }));
  });

  it("sends the CAN when the confirm button is pressed", () => {
    const { getByLabelText, getByTestId } = renderComponent();

    fireEvent.changeText(
      getByLabelText(I18n.t("authentication.cie.pin.accessibility.label")),
      COMPLETE_CAN
    );
    fireEvent.press(getByTestId("itwCieCanConfirmButtonTestID"));

    expect(mockSend).toHaveBeenCalledWith({
      type: "cie-can-entered",
      can: COMPLETE_CAN
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
        <ItwCieCanScreen />
      </ItwEidIssuanceMachineContext.Provider>
    ),
    ITW_ROUTES.IDENTIFICATION.CIE.CAN_SCREEN,
    {},
    createStore(appReducer, globalState as any)
  );
};
