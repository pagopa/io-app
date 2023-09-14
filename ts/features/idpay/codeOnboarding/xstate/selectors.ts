import { StateFrom } from "xstate";
import { IDPayCodeOnboardingMachineType } from "./machine";

type StateWithContext = StateFrom<IDPayCodeOnboardingMachineType>;

export const selectCurrentPage = (state: StateWithContext) => state.value;
