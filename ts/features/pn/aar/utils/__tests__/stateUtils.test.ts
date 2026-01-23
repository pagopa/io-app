import {
  AARFlowState,
  isValidAARStateTransition,
  maybeIunFromAarFlowState,
  sendAARFlowStates,
  validAARStatusTransitions
} from "../stateUtils";
import { sendAarMockStates, sendAarStateNames } from "../testUtils";

function splitAllowedFromNotallowedTransitions(
  ...aarAllowedTransitions: Array<AARFlowState["type"]>
) {
  return sendAarStateNames.reduce<
    [Array<AARFlowState["type"]>, Array<AARFlowState["type"]>]
  >(
    ([allowed, notAllowed], stateName) => {
      const isAllowed = aarAllowedTransitions.includes(stateName);

      return isAllowed
        ? [[...allowed, stateName], notAllowed]
        : [allowed, [...notAllowed, stateName]];
    },
    [[], []]
  );
}

describe("stateUtils", () => {
  describe("isValidAARStateTransition", () => {
    const sendAllowedTransitions: Array<
      [AARFlowState["type"], Array<AARFlowState["type"]>]
    > = [
      [sendAARFlowStates.none, [sendAARFlowStates.displayingAARToS]],
      [sendAARFlowStates.displayingAARToS, [sendAARFlowStates.fetchingQRData]],
      [
        sendAARFlowStates.fetchingQRData,
        [
          sendAARFlowStates.fetchingNotificationData,
          sendAARFlowStates.notAddresseeFinal,
          sendAARFlowStates.notAddressee,
          sendAARFlowStates.ko
        ]
      ],
      [
        sendAARFlowStates.fetchingNotificationData,
        [sendAARFlowStates.displayingNotificationData, sendAARFlowStates.ko]
      ],
      [sendAARFlowStates.displayingNotificationData, []],
      [sendAARFlowStates.notAddresseeFinal, []],
      [
        sendAARFlowStates.ko,
        [
          sendAARFlowStates.fetchingQRData,
          sendAARFlowStates.fetchingNotificationData,
          sendAARFlowStates.cieCanAdvisory
        ]
      ],
      [
        sendAARFlowStates.notAddressee,
        [
          sendAARFlowStates.creatingMandate,
          sendAARFlowStates.nfcNotSupportedFinal
        ]
      ],
      [
        sendAARFlowStates.creatingMandate,
        [sendAARFlowStates.cieCanAdvisory, sendAARFlowStates.ko]
      ],
      [sendAARFlowStates.cieCanAdvisory, [sendAARFlowStates.cieCanInsertion]],
      [
        sendAARFlowStates.cieCanInsertion,
        [
          sendAARFlowStates.cieCanAdvisory,
          sendAARFlowStates.cieScanningAdvisory
        ]
      ],
      [
        sendAARFlowStates.cieScanningAdvisory,
        [
          sendAARFlowStates.cieCanInsertion,
          sendAARFlowStates.androidNFCActivation,
          sendAARFlowStates.cieScanning
        ]
      ],
      [sendAARFlowStates.androidNFCActivation, [sendAARFlowStates.cieScanning]],
      [
        sendAARFlowStates.cieScanning,
        [
          sendAARFlowStates.cieScanningAdvisory,
          sendAARFlowStates.validatingMandate
        ]
      ],
      [
        sendAARFlowStates.validatingMandate,
        [sendAARFlowStates.fetchingNotificationData, sendAARFlowStates.ko]
      ]
    ];

    describe.each(sendAllowedTransitions)(
      'AAR state is "%s"',
      (currentStep, allowedTransitions) => {
        const [allowed, notAllowed] = splitAllowedFromNotallowedTransitions(
          ...allowedTransitions
        );

        allowed.forEach(nextStep => {
          it(`should allow the transition from "${currentStep}" to "${nextStep}"`, () => {
            expect(isValidAARStateTransition(currentStep, nextStep)).toBe(true);
          });
        });

        notAllowed.forEach(nextStep => {
          it(`should deny the transition from "${currentStep}" to "${nextStep}"`, () => {
            expect(isValidAARStateTransition(currentStep, nextStep)).toBe(
              false
            );
          });
        });
      }
    );
  });
  describe("snapshots", () => {
    it("validTransitions", () => {
      expect(validAARStatusTransitions).toMatchSnapshot();
    });
    it("flowStates", () => {
      expect(sendAARFlowStates).toMatchSnapshot();
    });
  });
  describe("maybeIunFromAarFlowState", () => {
    it("should handle all the possible states", () => {
      sendAarMockStates.forEach(state => {
        switch (state.type) {
          case sendAARFlowStates.notAddresseeFinal:
          case sendAARFlowStates.fetchingNotificationData:
          case sendAARFlowStates.displayingNotificationData:
            expect(maybeIunFromAarFlowState(state)).toBe(state.iun);
            break;
          case sendAARFlowStates.ko:
            expect(maybeIunFromAarFlowState(state)).toBe(
              maybeIunFromAarFlowState(state.previousState)
            );
            break;
          default:
            expect(maybeIunFromAarFlowState(state)).toBeUndefined();
            break;
        }
      });
    });
  });
});
