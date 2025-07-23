import { StateFrom } from "xstate";
import { ItwCieMachine } from "./machine";

type MachineSnapshot = StateFrom<ItwCieMachine>;

export const selectCurrentState = (snapshot: MachineSnapshot) => snapshot.value;

export const selectAuthenticationUrl = (snapshot: MachineSnapshot) =>
  snapshot.context.authenticationUrl;

export const selectAuthorizationUrl = (snapshot: MachineSnapshot) =>
  snapshot.context.authorizationUrl;

export const selectRedirectUrl = (snapshot: MachineSnapshot) =>
  snapshot.context.redirectUrl;

export const selectReadProgress = (snapshot: MachineSnapshot) =>
  snapshot.context.readProgress || 0;

export const selectFailure = (snapshot: MachineSnapshot) =>
  snapshot.context.failure;
