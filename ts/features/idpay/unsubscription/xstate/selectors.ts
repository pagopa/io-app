import { createSelector } from "reselect";
import { StateFrom } from "xstate";
import { LOADING_TAG } from "../../../../utils/xstate";
import { IDPayUnsubscriptionMachineType } from "./machine";

type StateWithContext = StateFrom<IDPayUnsubscriptionMachineType>;

export const selectInitiativeName = (state: StateWithContext) =>
  state.context.initiativeName;

const selectTags = (state: StateWithContext) => state.tags;

export const isLoadingSelector = createSelector(selectTags, tags =>
  tags.has(LOADING_TAG)
);

export const selectChecks = (state: StateWithContext) => state.context.checks;

export const areChecksFullfilledSelector = createSelector(
  selectChecks,
  checks => !checks.find(c => !c.value)
);
