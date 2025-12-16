import { StateFrom } from "xstate";
import { ItwTrustmarkMachine } from "./machine";

type MachineSnapshot = StateFrom<ItwTrustmarkMachine>;

export const selectTrustmarkUrl = ({ context }: MachineSnapshot) =>
  context.trustmarkUrl;

export const selectExpirationSeconds = ({ context }: MachineSnapshot) =>
  context.expirationSeconds;

export const selectFailure = ({ context }: MachineSnapshot) => context.failure;
