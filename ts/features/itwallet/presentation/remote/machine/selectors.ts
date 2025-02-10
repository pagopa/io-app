import { StateFrom } from "xstate";
import { ItwTags } from "../../../machine/tags.ts";
import { ItwRemoteMachine } from "./machine.ts";
import * as O from "fp-ts/Option";

type MachineSnapshot = StateFrom<ItwRemoteMachine>;

export const selectIsLoading = (snapshot: MachineSnapshot) =>
  snapshot.hasTag(ItwTags.Loading);

export const selectFailureOption = (snapshot: MachineSnapshot) =>
  O.fromNullable(snapshot.context.failure);
