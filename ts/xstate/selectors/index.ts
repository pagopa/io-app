import { createSelector } from "reselect";
import { AnyActorLogic, SnapshotFrom } from "xstate";
import { LOADING_TAG, UPSERTING_TAG } from "../utils";

type MachineSnapshot = SnapshotFrom<AnyActorLogic>;

const selectTags = ({ tags }: MachineSnapshot) => tags;

export const isLoadingSelector = createSelector(selectTags, tags =>
  tags.has(LOADING_TAG)
);

export const isUpseringSelector = createSelector(selectTags, tags =>
  tags.has(UPSERTING_TAG)
);
