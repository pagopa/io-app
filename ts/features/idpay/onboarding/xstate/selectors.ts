import { pipe } from "fp-ts/lib/function";
import { StateFrom } from "xstate";
import * as O from "fp-ts/lib/Option";
import { LOADING_TAG } from "../../../../utils/xstate";
import { IDPayOnboardingMachineType } from "./machine";
import { OnboardingFailureType } from "./failure";

type StateWithContext = StateFrom<IDPayOnboardingMachineType>;

const isLoadingSelector = (state: StateWithContext) =>
  state.hasTag(LOADING_TAG as never);

const failureSelector = (state: StateWithContext) =>
  pipe(
    state.context.failure,
    O.filter(_ => _ in OnboardingFailureType)
  );

export { isLoadingSelector, failureSelector };
