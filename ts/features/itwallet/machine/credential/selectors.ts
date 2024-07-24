import * as O from "fp-ts/lib/Option";
import { StateFrom } from "xstate5";
import { ItwTags } from "../tags";
import { ItwCredentialIssuanceMachine } from "./machine";

type MachineSnapshot = StateFrom<ItwCredentialIssuanceMachine>;

export const selectIsLoading = (snapshot: MachineSnapshot) =>
  snapshot.hasTag(ItwTags.Loading);

export const selectCredentialTypeOption = (snapshot: MachineSnapshot) =>
  O.fromNullable(snapshot.context.credentialType);

export const selectIssuerConfigurationOption = (snapshot: MachineSnapshot) =>
  O.fromNullable(snapshot.context.issuerConf);

export const selectRequestedCredentialOption = (snapshot: MachineSnapshot) =>
  O.fromNullable(snapshot.context.requestedCredential);

export const selectCredentialOption = (snapshot: MachineSnapshot) =>
  O.fromNullable(snapshot.context.credential);

export const selectFailureOption = (snapshot: MachineSnapshot) =>
  O.fromNullable(snapshot.context.failure);
