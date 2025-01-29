import { StateFrom } from "xstate";
import { ItwTags } from "../tags";
import { ItwRemotePresentationMachine } from "./machine";

type MachineSnapshot = StateFrom<ItwRemotePresentationMachine>;

export const selectIsLoading = (snapshot: MachineSnapshot) =>
  snapshot.hasTag(ItwTags.Loading);