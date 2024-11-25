import { StateFrom } from "xstate";
import { ItwTrustmarkMachine } from "./machine";

type MachineSnapshot = StateFrom<ItwTrustmarkMachine>;

export const selectTrustmarkUrl = ({ context }: MachineSnapshot) =>
  context.trustmarkUrl;

export const selectExpirationSeconds = ({ context }: MachineSnapshot) =>
  context.expirationSeconds;
