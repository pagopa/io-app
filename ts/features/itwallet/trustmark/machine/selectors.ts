import { StateFrom } from "xstate";
import { ItwTrustmarkMachine } from "./machine";

type MachineSnapshot = StateFrom<ItwTrustmarkMachine>;

export const selectTrustmarkUrl = (snapshot: MachineSnapshot): string =>
  snapshot.context.trustmarkUrl || "";
