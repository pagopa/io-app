import { StateFrom } from "xstate";
import { ItwTags } from "../../../machine/tags.ts";
import { ItwRemoteMachine } from "./machine.ts";

type MachineSnapshot = StateFrom<ItwRemoteMachine>;

export const selectIsLoading = (snapshot: MachineSnapshot) =>
  snapshot.hasTag(ItwTags.Loading);
