import { StateFrom } from "xstate";
import { IDPayOnboardingMachineType } from "./machine";

type StateWithContext = StateFrom<IDPayOnboardingMachineType>;

const selectInitiativeStatus = (state: StateWithContext) =>
  state.context.initiativeStatus;

const selectOnboardingFailure = (state: StateWithContext) =>
  state.context.failure;

export { selectInitiativeStatus, selectOnboardingFailure };
