import {
  AarFlowState,
  isValidAarStateTransition,
  maybeIunFromAarFlowState,
  sendAarFlowStates,
  validAarStatusTransitions
} from "../stateUtils";
import { sendAarMockStates, sendAarStateNames } from "../testUtils";

function splitAllowedFromNotallowedTransitions(
  ...aarAllowedTransitions: Array<AarFlowState["type"]>
) {
  return sendAarStateNames.reduce<
    [Array<AarFlowState["type"]>, Array<AarFlowState["type"]>]
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
  describe("isValidAarStateTransition", () => {
    const sendAllowedTransitions: Array<
      [AarFlowState["type"], Array<AarFlowState["type"]>]
    > = [
      [sendAarFlowStates.none, [sendAarFlowStates.displayingAarToS]],
      [sendAarFlowStates.displayingAarToS, [sendAarFlowStates.fetchingQRData]],
      [
        sendAarFlowStates.fetchingQRData,
        [
          sendAarFlowStates.fetchingNotificationData,
          sendAarFlowStates.notAddresseeFinal,
          sendAarFlowStates.notAddressee,
          sendAarFlowStates.ko
        ]
      ],
      [
        sendAarFlowStates.fetchingNotificationData,
        [sendAarFlowStates.displayingNotificationData, sendAarFlowStates.ko]
      ],
      [sendAarFlowStates.displayingNotificationData, []],
      [sendAarFlowStates.notAddresseeFinal, []],
      [
        sendAarFlowStates.ko,
        [
          sendAarFlowStates.fetchingQRData,
          sendAarFlowStates.fetchingNotificationData,
          sendAarFlowStates.cieCanAdvisory
        ]
      ],
      [
        sendAarFlowStates.notAddressee,
        [
          sendAarFlowStates.creatingMandate,
          sendAarFlowStates.nfcNotSupportedFinal
        ]
      ],
      [
        sendAarFlowStates.creatingMandate,
        [sendAarFlowStates.cieCanAdvisory, sendAarFlowStates.ko]
      ],
      [sendAarFlowStates.cieCanAdvisory, [sendAarFlowStates.cieCanInsertion]],
      [
        sendAarFlowStates.cieCanInsertion,
        [
          sendAarFlowStates.cieCanAdvisory,
          sendAarFlowStates.cieScanningAdvisory
        ]
      ],
      [
        sendAarFlowStates.cieScanningAdvisory,
        [
          sendAarFlowStates.cieCanInsertion,
          sendAarFlowStates.androidNFCActivation,
          sendAarFlowStates.cieScanning
        ]
      ],
      [sendAarFlowStates.androidNFCActivation, [sendAarFlowStates.cieScanning]],
      [
        sendAarFlowStates.cieScanning,
        [
          sendAarFlowStates.cieScanningAdvisory,
          sendAarFlowStates.cieCanAdvisory,
          sendAarFlowStates.validatingMandate
        ]
      ],
      [
        sendAarFlowStates.validatingMandate,
        [sendAarFlowStates.fetchingNotificationData, sendAarFlowStates.ko]
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
            expect(isValidAarStateTransition(currentStep, nextStep)).toBe(true);
          });
        });

        notAllowed.forEach(nextStep => {
          it(`should deny the transition from "${currentStep}" to "${nextStep}"`, () => {
            expect(isValidAarStateTransition(currentStep, nextStep)).toBe(
              false
            );
          });
        });
      }
    );
  });
  describe("snapshots", () => {
    it("validTransitions", () => {
      expect(validAarStatusTransitions).toMatchSnapshot();
    });
    it("flowStates", () => {
      expect(sendAarFlowStates).toMatchSnapshot();
    });
  });
  describe("maybeIunFromAarFlowState", () => {
    it("should handle all the possible states", () => {
      sendAarMockStates.forEach(state => {
        switch (state.type) {
          case sendAarFlowStates.displayingNotificationData:
          case sendAarFlowStates.fetchingNotificationData:
          case sendAarFlowStates.notAddresseeFinal:
            expect(maybeIunFromAarFlowState(state)).toBe(state.iun);
            break;
          case sendAarFlowStates.ko:
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
