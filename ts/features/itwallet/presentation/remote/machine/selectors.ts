import { StateFrom } from "xstate";
import * as O from "fp-ts/Option";
import { ItwPresentationTags } from "./tags";
import { ItwRemoteMachine } from "./machine";

type MachineSnapshot = StateFrom<ItwRemoteMachine>;

export const selectIsLoading = (snapshot: MachineSnapshot) =>
  snapshot.hasTag(ItwPresentationTags.Loading);

export const selectFailureOption = (snapshot: MachineSnapshot) =>
  O.fromNullable(snapshot.context.failure);

export const selectPresentationDetails = (snapshot: MachineSnapshot) =>
  snapshot.context.presentationDetails;

export const selectRelyingPartyName = (snapshot: MachineSnapshot) =>
  snapshot.context.rpConf?.federation_entity.organization_name;
