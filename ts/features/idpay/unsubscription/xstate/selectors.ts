import { StateFrom } from "xstate";
import { IDPayUnsubscriptionMachineType } from "./machine";

type StateWithContext = StateFrom<IDPayUnsubscriptionMachineType>;

export const selectInitiativeName = (state: StateWithContext) =>
  state.context.initiativeName;
