import * as O from "fp-ts/lib/Option";
import { StateFrom } from "xstate5";
import { ItwTags } from "../tags";
import { ItwEidIssuanceMachine } from "./machine";

type MachineSnapshot = StateFrom<ItwEidIssuanceMachine>;

export const selectIsLoading = (snapshot: MachineSnapshot) =>
  snapshot.hasTag(ItwTags.Loading);

export const selectEidOption = (snapshot: MachineSnapshot) =>
  O.fromNullable(snapshot.context.eid);

export const selectFailureOption = (snapshot: MachineSnapshot) =>
  O.fromNullable(snapshot.context.failure);

export const selectIdentification = (snapshot: MachineSnapshot) =>
  snapshot.context.identification;
