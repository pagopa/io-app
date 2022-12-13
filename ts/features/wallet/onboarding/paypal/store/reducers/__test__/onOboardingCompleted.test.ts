import * as O from "fp-ts/lib/Option";
import { GlobalState } from "../../../../../../../store/reducers/types";
import { appReducer } from "../../../../../../../store/reducers";
import { reproduceSequence } from "../../../../../../../utils/tests";
import {
  paypalOnboardingCompletedSelector,
  paypalOnboardingOutcomeCodeSelector
} from "../onOboardingCompleted";
import { applicationChangeState } from "../../../../../../../store/actions/application";
import {
  walletAddPaypalCompleted,
  walletAddPaypalOutcome,
  walletAddPaypalStart
} from "../../actions";

describe("onboardingCompletedReducer", () => {
  describe("when the store is empty", () => {
    it("should return the default state", () => {
      const state: GlobalState = reproduceSequence(
        {} as GlobalState,
        appReducer,
        [applicationChangeState("active")]
      );
      expect(paypalOnboardingCompletedSelector(state)).toBeUndefined();
      expect(paypalOnboardingOutcomeCodeSelector(state)).toBeUndefined();
    });
  });

  describe("when the onboarding starts", () => {
    describe("and it starts from the wallet", () => {
      it("should return 'payment_method_details' and outcome should be undefined", () => {
        const state: GlobalState = reproduceSequence(
          {} as GlobalState,
          appReducer,
          [
            applicationChangeState("active"),
            walletAddPaypalStart("payment_method_details")
          ]
        );
        expect(paypalOnboardingCompletedSelector(state)).toEqual(
          "payment_method_details"
        );
        expect(paypalOnboardingOutcomeCodeSelector(state)).toBeUndefined();
      });
    });

    describe("and it starts during a payment", () => {
      it("should return 'back' and outcome should be undefined", () => {
        const state: GlobalState = reproduceSequence(
          {} as GlobalState,
          appReducer,
          [applicationChangeState("active"), walletAddPaypalStart("back")]
        );
        expect(paypalOnboardingCompletedSelector(state)).toEqual("back");
        expect(paypalOnboardingOutcomeCodeSelector(state)).toBeUndefined();
      });
    });
  });

  describe("when walletAddPaypalOutcome (with outcome) is dispatched", () => {
    it("should return the outcome", () => {
      const state: GlobalState = reproduceSequence(
        {} as GlobalState,
        appReducer,
        [walletAddPaypalOutcome(O.some("outcomeX"))]
      );
      expect(paypalOnboardingOutcomeCodeSelector(state)).toEqual("outcomeX");
    });
  });

  describe("when walletAddPaypalOutcome (with no outcome) is dispatched", () => {
    it("should return the outcome", () => {
      const state: GlobalState = reproduceSequence(
        {} as GlobalState,
        appReducer,
        [walletAddPaypalOutcome(O.none)]
      );
      expect(paypalOnboardingOutcomeCodeSelector(state)).toBeUndefined();
    });
  });

  describe("when the walletAddPaypalStart and walletAddPaypalOutcome are dispatched", () => {
    it("should return the expected state", () => {
      const state: GlobalState = reproduceSequence(
        {} as GlobalState,
        appReducer,
        [
          walletAddPaypalStart("payment_method_details"),
          walletAddPaypalOutcome(O.some("outcomeX"))
        ]
      );
      expect(paypalOnboardingOutcomeCodeSelector(state)).toEqual("outcomeX");
      expect(paypalOnboardingCompletedSelector(state)).toEqual(
        "payment_method_details"
      );
    });
  });

  describe("when the onboarding is completed", () => {
    it("should reset the state", () => {
      const state: GlobalState = reproduceSequence(
        {} as GlobalState,
        appReducer,
        [
          walletAddPaypalStart("payment_method_details"),
          walletAddPaypalOutcome(O.some("outcomeX")),
          walletAddPaypalCompleted()
        ]
      );
      expect(paypalOnboardingOutcomeCodeSelector(state)).toBeUndefined();
      expect(paypalOnboardingCompletedSelector(state)).toBeUndefined();
    });
  });
});
