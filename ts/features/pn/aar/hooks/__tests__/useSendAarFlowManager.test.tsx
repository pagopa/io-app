import { act, renderHook } from "@testing-library/react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { ServiceId } from "../../../../../../definitions/backend/ServiceId";
import * as ANALYTICS from "../../analytics";
import { terminateAarFlow } from "../../store/actions";
import {
  AARFlowState,
  AARFlowStateName,
  isValidAARStateTransition,
  sendAARFlowStates
} from "../../utils/stateUtils";
import { useSendAarFlowManager } from "../useSendAarFlowManager";

const mockPopToTop = jest.fn();
const mockGetParent = jest.fn();
const mockParentPopToTop = jest.fn();
const mockDispatch = jest.fn();
const mockSelector = jest.fn();

jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useNavigation: () => ({
    popToTop: mockPopToTop,
    getParent: mockGetParent
  })
}));
jest.mock("../../../../../store/hooks", () => ({
  useIODispatch: () => mockDispatch,
  useIOSelector: (selector: any) => mockSelector(selector)
}));

const mockParentNavigationObject: Partial<StackNavigationProp<any>> = {
  popToTop: mockParentPopToTop
};

describe("useSendAarFlowManager", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  [mockParentNavigationObject, undefined].forEach(parentNavObj => {
    const isParentNavDefined = parentNavObj !== undefined;

    const parentNavStatus = isParentNavDefined
      ? "is defined"
      : "is not defined";
    const popTopTarget = isParentNavDefined ? "parent's" : "";

    it(`should dispatch "terminateAarFlow" and${popTopTarget} popToTop when calling the flow termination handle if the parent's navigation stack ${parentNavStatus}`, () => {
      mockSelector.mockReturnValue(() => ({ type: "test" }));
      mockGetParent.mockReturnValue(parentNavObj);

      const { result } = renderHook(useSendAarFlowManager);
      expect(mockPopToTop).toHaveBeenCalledTimes(0);
      expect(mockParentPopToTop).toHaveBeenCalledTimes(0);
      expect(mockDispatch).toHaveBeenCalledTimes(0);

      act(() => {
        result.current.terminateFlow();
      });

      if (isParentNavDefined) {
        expect(mockParentPopToTop).toHaveBeenCalledTimes(1);
        expect(mockPopToTop).not.toHaveBeenCalled();
      } else {
        expect(mockPopToTop).toHaveBeenCalledTimes(1);
        expect(mockParentPopToTop).not.toHaveBeenCalled();
      }
      expect(mockDispatch).toHaveBeenCalledTimes(1);
      expect(mockDispatch).toHaveBeenCalledWith(
        terminateAarFlow({ messageId: undefined })
      );
    });
  });
  Object.values(sendAARFlowStates).forEach(stateKind => {
    it(`should navigate to a valid state when calling "goToNextState" when the state type is ${stateKind} and ${
      stateKind === sendAARFlowStates.displayingAARToS ? "" : "not "
    }call trackSendAARToSAccepted`, () => {
      const spiedOnMockedTrackSendAARToSAccepted = jest
        .spyOn(ANALYTICS, "trackSendAARToSAccepted")
        .mockImplementation();
      mockSelector.mockImplementation(
        () =>
          ({
            type: stateKind
          } as AARFlowState)
      );

      const { result } = renderHook(useSendAarFlowManager);
      act(() => {
        result.current.goToNextState();
      });
      switch (stateKind) {
        case sendAARFlowStates.displayingAARToS:
          const isValid = isValidAARStateTransition(
            stateKind,
            mockDispatch.mock.calls[0][0].payload.type as AARFlowStateName
          );
          expect(spiedOnMockedTrackSendAARToSAccepted.mock.calls.length).toBe(
            1
          );
          expect(
            spiedOnMockedTrackSendAARToSAccepted.mock.calls[0].length
          ).toBe(0);
          expect(mockDispatch).toHaveBeenCalledTimes(1);
          expect(isValid).toBe(true);
          break;
        default:
          expect(spiedOnMockedTrackSendAARToSAccepted.mock.calls.length).toBe(
            0
          );
          expect(mockDispatch).not.toHaveBeenCalled();
          break;
      }
    });
  });
  it('should return "currentFlowData" as a 1/1 of the selector`s value', () => {
    const value: AARFlowState = {
      type: sendAARFlowStates.displayingNotificationData,
      recipientInfo: {
        denomination: "Mario Rossi",
        taxId: "RSSMRA74D22A001Q"
      },
      notification: {},
      mandateId: "mandateID",
      iun: "IUN123",
      pnServiceId: "SERVICEID123" as ServiceId
    };
    mockSelector.mockImplementation(() => value);

    const { result } = renderHook(useSendAarFlowManager);

    expect(result.current.currentFlowData).toEqual(value);
  });
});
