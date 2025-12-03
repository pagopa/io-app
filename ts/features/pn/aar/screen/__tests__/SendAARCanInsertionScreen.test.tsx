import { createStore } from "redux";
import { fireEvent, waitFor } from "@testing-library/react-native";
import { act, RefObject } from "react";
import { Keyboard, TextInput, View } from "react-native";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import PN_ROUTES from "../../../navigation/routes";
import {
  CIE_CAN_LENGTH,
  SendAARCieCanInsertionScreen,
  SendAARCieCanInsertionScreenProps
} from "../SendAARCieCanInsertionScreen";
import * as ACCESSIBILITY_UTILS from "../../../../../utils/accessibility";
import { sendAarMockStateFactory } from "../../utils/testUtils";
import { sendAARFlowStates } from "../../utils/stateUtils";
import * as AAR_SELECTORS from "../../store/selectors";
import { setAarFlowState } from "../../store/actions";

const mockDispatch = jest.fn();
const mockGoBack = jest.fn();

jest.mock("../../../../../store/hooks", () => ({
  ...jest.requireActual("../../../../../store/hooks"),
  useIODispatch: () => mockDispatch
}));

jest.mock("i18next", () => ({
  t: (path: string) => path
}));

describe("SendAARCieCanInsertionScreen", () => {
  beforeEach(jest.clearAllMocks);

  it("should match the snapshot", () => {
    const component = renderComponent();

    expect(component.toJSON()).toMatchSnapshot();
  });
  it('should call "setAccessibilityFocus" when component is focussed', async () => {
    const spyOnSetAccessibilityFocus = jest.spyOn(
      ACCESSIBILITY_UTILS,
      "setAccessibilityFocus"
    );

    renderComponent();

    await waitFor(() => {
      expect(spyOnSetAccessibilityFocus).toHaveBeenCalledTimes(1);
      expect(spyOnSetAccessibilityFocus).toHaveBeenCalledWith(
        { current: expect.any(View) } as RefObject<View>,
        300
      );
    });

    expect(mockDispatch).not.toHaveBeenCalled();
    expect(mockGoBack).not.toHaveBeenCalled();
  });

  Object.values(sendAarMockStateFactory).forEach(getAarState => {
    const aarState = getAarState();
    const isCieCanInsertion =
      aarState.type === sendAARFlowStates.cieCanInsertion;

    it(`${
      isCieCanInsertion ? "should" : "should not"
    } dispatch "setAarFlowState" with type: "cieCanAdvisory" and navigate back when current aar state has type: "${
      aarState.type
    }"`, () => {
      jest.spyOn(AAR_SELECTORS, "currentAARFlowData").mockReturnValue(aarState);
      const { getByLabelText } = renderComponent();

      const backButton = getByLabelText("global.buttons.back");

      fireEvent.press(backButton);

      if (isCieCanInsertion) {
        expect(mockDispatch).toHaveBeenCalledTimes(1);
        expect(mockDispatch).toHaveBeenCalledWith(
          setAarFlowState({
            ...aarState,
            type: sendAARFlowStates.cieCanAdvisory
          })
        );
        expect(mockGoBack).toHaveBeenCalledTimes(1);
      } else {
        expect(mockDispatch).not.toHaveBeenCalled();
        expect(mockGoBack).not.toHaveBeenCalled();
      }
    });

    ["1", "12", "123", "1234", "12345", "123456"].forEach(can => {
      const isCanValid = can.length === CIE_CAN_LENGTH;

      it(`${
        isCanValid && isCieCanInsertion ? "should" : "should not"
      } dispatch "setAarFlowState" with type: "cieScanningAdvisory" and dismiss the keyboard when current aar state has type: "${
        aarState.type
      }" and can is: "${can}"`, () => {
        jest
          .spyOn(AAR_SELECTORS, "currentAARFlowData")
          .mockReturnValue(aarState);
        const spyOnKeyboardDismiss = jest.spyOn(Keyboard, "dismiss");
        const { UNSAFE_getByType } = renderComponent();

        // Exclude initial call made by the testing environment
        // to ensure we only verify calls triggered by changeText logic.
        spyOnKeyboardDismiss.mockClear();

        const otpInput = UNSAFE_getByType(TextInput);
        act(() => {
          fireEvent.changeText(otpInput, can);
        });

        if (isCieCanInsertion && isCanValid) {
          expect(mockDispatch).toHaveBeenCalledTimes(1);
          expect(mockDispatch).toHaveBeenCalledWith(
            setAarFlowState({
              ...aarState,
              type: sendAARFlowStates.cieScanningAdvisory,
              can
            })
          );
          expect(spyOnKeyboardDismiss).toHaveBeenCalledTimes(1);
        } else {
          expect(mockDispatch).not.toHaveBeenCalled();
          expect(spyOnKeyboardDismiss).not.toHaveBeenCalled();
        }
        expect(mockGoBack).not.toHaveBeenCalled();
      });
    });
  });
});

function renderComponent() {
  const baseState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, baseState as any);

  return renderScreenWithNavigationStoreContext<GlobalState>(
    ({ route, navigation }: SendAARCieCanInsertionScreenProps) => (
      <SendAARCieCanInsertionScreen
        route={route}
        navigation={{ ...navigation, goBack: mockGoBack }}
      />
    ),
    PN_ROUTES.SEND_AAR_CIE_CAN_INSERTION,
    {},
    store
  );
}
