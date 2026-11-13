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
import { ItwCiePinScreen } from "../ItwCiePinScreen";

const mockSend = jest.fn();

const COMPLETE_PIN = "12345678";
const PARTIAL_PIN = "1234567";
const CONFIRM_BUTTON_TEST_ID = "itwCiePinConfirmButtonTestID";
const PIN_ENTERED_EVENT = { type: "cie-pin-entered", pin: COMPLETE_PIN };

const typePin = (
  { getByLabelText }: ReturnType<typeof renderComponent>,
  pin: string
) =>
  fireEvent.changeText(
    getByLabelText(I18n.t("authentication.cie.pin.accessibility.label")),
    pin
  );

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

  describe("when the screen reader is disabled", () => {
    it("does not render the confirm button", () => {
      const { queryByTestId } = renderComponent(false);

      expect(queryByTestId(CONFIRM_BUTTON_TEST_ID)).toBeNull();
    });

    it("does not send a partial PIN", () => {
      const screen = renderComponent(false);

      typePin(screen, PARTIAL_PIN);

      expect(mockSend).not.toHaveBeenCalled();
    });

    it("sends the PIN as soon as it is complete", () => {
      const screen = renderComponent(false);

      typePin(screen, COMPLETE_PIN);

      expect(mockSend).toHaveBeenCalledWith(PIN_ENTERED_EVENT);
    });
  });

  describe("when the screen reader is enabled", () => {
    it.each([
      { name: "partial PIN", pin: PARTIAL_PIN },
      { name: "complete PIN", pin: COMPLETE_PIN }
    ])("does not send the PIN when typing a $name", ({ pin }) => {
      const screen = renderComponent(true);

      typePin(screen, pin);

      expect(mockSend).not.toHaveBeenCalled();
    });

    it.each([
      { name: "disabled with a partial PIN", pin: PARTIAL_PIN, disabled: true },
      {
        name: "enabled with a complete PIN",
        pin: COMPLETE_PIN,
        disabled: false
      }
    ])("renders the confirm button $name", ({ pin, disabled }) => {
      const screen = renderComponent(true);

      typePin(screen, pin);

      expect(
        screen.getByTestId(CONFIRM_BUTTON_TEST_ID).props.accessibilityState
      ).toEqual(expect.objectContaining({ disabled }));
    });

    it("sends the PIN when the confirm button is pressed", () => {
      const screen = renderComponent(true);

      typePin(screen, COMPLETE_PIN);
      fireEvent.press(screen.getByTestId(CONFIRM_BUTTON_TEST_ID));

      expect(mockSend).toHaveBeenCalledWith(PIN_ENTERED_EVENT);
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
        <ItwCiePinScreen />
      </ItwEidIssuanceMachineContext.Provider>
    ),
    ITW_ROUTES.IDENTIFICATION.CIE.PIN_SCREEN,
    {},
    createStore(appReducer, globalState as any)
  );
};
