import { StateFrom } from "xstate";
import * as O from "fp-ts/Option";
import { ItwTags } from "../../../machine/tags.ts";
import { ItwRemoteMachine } from "./machine.ts";

type MachineSnapshot = StateFrom<ItwRemoteMachine>;

export const selectIsLoading = (snapshot: MachineSnapshot) =>
  snapshot.hasTag(ItwTags.Loading);

export const selectFailureOption = (snapshot: MachineSnapshot) =>
  O.fromNullable(snapshot.context.failure);
