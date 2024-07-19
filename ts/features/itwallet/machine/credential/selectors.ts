import { StateFrom } from "xstate5";
import { ItwTags } from "../tags";
import { ItwCredentialIssuanceMachine } from "./machine";

type MachineSnapshot = StateFrom<ItwCredentialIssuanceMachine>;

export const selectIsLoading = (snapshot: MachineSnapshot) =>
  snapshot.hasTag(ItwTags.Loading);

export const selectCredentialType = (snapshot: MachineSnapshot) =>
  snapshot.context.credentialType;

export const selecIssuerConfiguration = (snapshot: MachineSnapshot) =>
  snapshot.context.issuerConf;

export const selectRequestedCredential = (snapshot: MachineSnapshot) =>
  snapshot.context.requestedCredential;

export const selectCredential = (snapshot: MachineSnapshot) =>
  snapshot.context.credential;

export const selectFailureOption = (snapshot: MachineSnapshot) =>
  snapshot.context.failure;
