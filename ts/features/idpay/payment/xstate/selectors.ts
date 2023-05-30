import { createSelector } from "reselect";
import { StateFrom } from "xstate";
import { LOADING_TAG, WAITING_USER_INPUT_TAG } from "../../../../utils/xstate";
import { IDPayPaymentMachineType } from "./machine";

type StateWithContext = StateFrom<IDPayPaymentMachineType>;

const selectTags = (state: StateWithContext) => state.tags;

export const selectTransactionData = (state: StateWithContext) =>
  state.context.transaction;

export const isLoadingSelector = createSelector(selectTags, tags =>
  tags.has(LOADING_TAG)
);

export const isAwaitingUserInputSelector = createSelector(selectTags, tags =>
  tags.has(WAITING_USER_INPUT_TAG)
);

export const isFailureSelector = (state: StateWithContext) =>
  state.matches("PAYMENT_FAILURE");
