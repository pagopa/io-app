import { AnyMachineSnapshot } from "xstate";
import { IdPayTags } from "./tags";

export const isLoadingSelector = (snapshot: AnyMachineSnapshot) =>
  snapshot.hasTag(IdPayTags.Loading);

export const isUpsertingSelector = (snapshot: AnyMachineSnapshot) =>
  snapshot.hasTag(IdPayTags.Upserting);
