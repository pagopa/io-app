import { createSelector } from "reselect";
import { StateFrom } from "xstate";
import { LOADING_TAG } from "../../../../utils/xstate";
import { IDPayPaymentMachineType } from "./machine";

type StateWithContext = StateFrom<IDPayPaymentMachineType>;

const selectTags = (state: StateWithContext) => state.tags;

export const isLoadingSelector = createSelector(selectTags, tags =>
  tags.has(LOADING_TAG)
);
