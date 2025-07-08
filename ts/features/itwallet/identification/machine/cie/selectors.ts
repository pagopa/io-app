import { StateFrom } from "xstate";
import { ItwCieMachine } from "./machine";

type MachineSnapshot = StateFrom<ItwCieMachine>;

export const selectCurrentState = (snapshot: MachineSnapshot) => snapshot.value;

export const selectReadProgress = (snapshot: MachineSnapshot) =>
  snapshot.context.readProgress || 0;
