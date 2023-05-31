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

export const selectIsFailure = (state: StateWithContext) =>
  state.matches("UNSUBSCRIPTION_FAILURE");

export const selectInitiativeType = (state: StateWithContext) =>
  state.context.initiativeType;
