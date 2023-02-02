import { pipe } from "fp-ts/lib/function";
import { StateFrom } from "xstate";
import * as O from "fp-ts/lib/Option";
import { IDPayOnboardingMachineType } from "./machine";
import { OnboardingFailure } from "./failure";

type StateWithContext = StateFrom<IDPayOnboardingMachineType>;

const selectInitiativeStatus = (state: StateWithContext) =>
  state.context.initiativeStatus;

const selectOnboardingFailure = (state: StateWithContext) =>
  pipe(
    state.context.failure,
    O.filter(_ => _ in OnboardingFailure)
  );

export { selectInitiativeStatus, selectOnboardingFailure };
