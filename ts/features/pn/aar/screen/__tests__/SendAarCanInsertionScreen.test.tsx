/* eslint-disable sonarjs/cognitive-complexity */
import { act, fireEvent, waitFor } from "@testing-library/react-native";
import _ from "lodash";
import { RefObject } from "react";
import { Keyboard, TextInput, View } from "react-native";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import * as ACCESSIBILITY_UTILS from "../../../../../utils/accessibility";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import PN_ROUTES from "../../../navigation/routes";
import { trackSendAarMandateCieCanEnter } from "../../analytics";
import { setAarFlowState } from "../../store/actions";
import * as AAR_SELECTORS from "../../store/selectors";
import { sendAARFlowStates } from "../../utils/stateUtils";
import { sendAarMockStates } from "../../utils/testUtils";
import {
  CIE_CAN_LENGTH,
  SendAarCieCanInsertionScreen,
  SendAarCieCanInsertionScreenProps
} from "../SendAarCieCanInsertionScreen";

const mockDispatch = jest.fn();
const mockReplace = jest.fn();
const mockShouldNeverCall = jest.fn();

jest.mock("../../analytics", () => ({
  trackSendAarMandateCieCanEnter: jest.fn()
}));

jest.mock("../../../../../store/hooks", () => ({
  ...jest.requireActual("../../../../../store/hooks"),
  useIODispatch: () => mockDispatch
}));

jest.mock("i18next", () => ({
  t: (path: string) => path
}));

describe("SendAarCieCanInsertionScreen", () => {
  beforeEach(jest.clearAllMocks);

  it("should match the snapshot", () => {
    const component = renderComponent();

    expect(component.toJSON()).toMatchSnapshot();
  });
  it('should call "setAccessibilityFocus" when component is focused', async () => {
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
  });

  it('should call "trackSendAarMandateCieCanEnter" when component is focused', async () => {
    renderComponent();

    await waitFor(() => {
      expect(trackSendAarMandateCieCanEnter).toHaveBeenCalledTimes(1);
    });

    expect(mockDispatch).not.toHaveBeenCalled();
  });

  sendAarMockStates.forEach(aarState => {
    const isCieCanInsertion =
      aarState.type === sendAARFlowStates.cieCanInsertion;
    const isCieScanningAdvisory =
      aarState.type === sendAARFlowStates.cieScanningAdvisory;
    const isCieCanAdvisory = aarState.type === sendAARFlowStates.cieCanAdvisory;
    const shouldNavigate = isCieCanAdvisory || isCieScanningAdvisory;

    it(`${
      isCieCanInsertion ? "should" : "should not"
    } dispatch "setAarFlowState" with type: "cieCanAdvisory" when current aar state has type: "${
      aarState.type
    }"`, () => {
      jest.spyOn(AAR_SELECTORS, "currentAARFlowData").mockReturnValue(aarState);
      const { getByLabelText } = renderComponent();

      const backButton = getByLabelText("global.buttons.back");

      act(() => {
        fireEvent.press(backButton);
      });

      if (isCieCanInsertion) {
        expect(mockDispatch).toHaveBeenCalledTimes(1);
        expect(mockDispatch).toHaveBeenCalledWith(
          setAarFlowState({
            ...aarState,
            type: sendAARFlowStates.cieCanAdvisory
          })
        );
      } else {
        expect(mockDispatch).not.toHaveBeenCalled();
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
      });
    });

    it(`${
      shouldNavigate ? "should" : "should not"
    } replace, and never navigate when type is: ${aarState.type}`, () => {
      jest.spyOn(AAR_SELECTORS, "currentAARFlowData").mockReturnValue(aarState);
      renderComponent();
      if (isCieCanAdvisory) {
        expect(mockReplace).toHaveBeenCalledTimes(1);
        expect(mockReplace).toHaveBeenCalledWith(
          PN_ROUTES.SEND_AAR_CIE_CAN_EDUCATIONAL,
          { animationTypeForReplace: "pop" }
        );
      }
      if (isCieScanningAdvisory) {
        expect(mockReplace).toHaveBeenCalledTimes(1);
        expect(mockReplace).toHaveBeenCalledWith(
          PN_ROUTES.SEND_AAR_CIE_CARD_READING_EDUCATIONAL,
          { animationTypeForReplace: "push" }
        );
      }

      expect(mockDispatch).not.toHaveBeenCalled();
      expect(mockShouldNeverCall).not.toHaveBeenCalled();
    });
  });
});

function renderComponent() {
  const baseState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, baseState as any);

  return renderScreenWithNavigationStoreContext<GlobalState>(
    ({ route, navigation }: SendAarCieCanInsertionScreenProps) => (
      <SendAarCieCanInsertionScreen
        route={route}
        navigation={{
          ..._.mapValues(navigation, () => mockShouldNeverCall),
          replace: mockReplace
        }}
      />
    ),
    PN_ROUTES.SEND_AAR_CIE_CAN_INSERTION,
    {},
    store
  );
}
