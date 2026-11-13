import { fireEvent } from "@testing-library/react-native";
import I18n from "i18next";
import { createStore } from "redux";
import { createActor } from "xstate";

import { applicationChangeState } from "../../../../../../store/actions/application";
import { setScreenReaderEnabled } from "../../../../../../store/actions/preferences";
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
const CONFIRM_BUTTON_TEST_ID = "itwCieCanConfirmButtonTestID";
const CAN_ENTERED_EVENT = { type: "cie-can-entered", can: COMPLETE_CAN };

const typeCan = (
  { getByLabelText }: ReturnType<typeof renderComponent>,
  can: string
) =>
  fireEvent.changeText(
    getByLabelText(I18n.t("authentication.cie.pin.accessibility.label")),
    can
  );

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

  describe("when the screen reader is disabled", () => {
    it("does not render the confirm button", () => {
      const { queryByTestId } = renderComponent(false);

      expect(queryByTestId(CONFIRM_BUTTON_TEST_ID)).toBeNull();
    });

    it("does not send a partial CAN", () => {
      const screen = renderComponent(false);

      typeCan(screen, PARTIAL_CAN);

      expect(mockSend).not.toHaveBeenCalled();
    });

    it("sends the CAN as soon as it is complete", () => {
      const screen = renderComponent(false);

      typeCan(screen, COMPLETE_CAN);

      expect(mockSend).toHaveBeenCalledWith(CAN_ENTERED_EVENT);
    });
  });

  describe("when the screen reader is enabled", () => {
    it.each([
      { name: "partial CAN", can: PARTIAL_CAN },
      { name: "complete CAN", can: COMPLETE_CAN }
    ])("does not send the CAN when typing a $name", ({ can }) => {
      const screen = renderComponent(true);

      typeCan(screen, can);

      expect(mockSend).not.toHaveBeenCalled();
    });

    it.each([
      { name: "disabled with a partial CAN", can: PARTIAL_CAN, disabled: true },
      {
        name: "enabled with a complete CAN",
        can: COMPLETE_CAN,
        disabled: false
      }
    ])("renders the confirm button $name", ({ can, disabled }) => {
      const screen = renderComponent(true);

      typeCan(screen, can);

      expect(
        screen.getByTestId(CONFIRM_BUTTON_TEST_ID).props.accessibilityState
      ).toEqual(expect.objectContaining({ disabled }));
    });

    it("sends the CAN when the confirm button is pressed", () => {
      const screen = renderComponent(true);

      typeCan(screen, COMPLETE_CAN);
      fireEvent.press(screen.getByTestId(CONFIRM_BUTTON_TEST_ID));

      expect(mockSend).toHaveBeenCalledWith(CAN_ENTERED_EVENT);
    });
  });
});

const renderComponent = (screenReaderEnabled: boolean) => {
  const globalState = appReducer(
    appReducer(undefined, applicationChangeState("active")),
    setScreenReaderEnabled({ screenReaderEnabled })
  );

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
