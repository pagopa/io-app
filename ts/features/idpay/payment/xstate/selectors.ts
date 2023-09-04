import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { createSelector } from "reselect";
import { StateFrom } from "xstate";
import { LOADING_TAG } from "../../../../xstate/utils";
import { IDPayPaymentMachineType } from "./machine";

type StateWithContext = StateFrom<IDPayPaymentMachineType>;

const selectTags = (state: StateWithContext) => state.tags;

export const isLoadingSelector = createSelector(selectTags, tags =>
  tags.has(LOADING_TAG)
);

export const selectIsPreAuthorizing = (state: StateWithContext) =>
  state.matches("PRE_AUTHORIZING");

export const selectIsAuthorizing = (state: StateWithContext) =>
  state.matches("AUTHORIZING");

export const selectIsCancelling = (state: StateWithContext) =>
  state.matches("CANCELLING");

export const selectIsFailure = (state: StateWithContext) =>
  state.matches("AUTHORIZATION_FAILURE");

export const selectIsCancelled = (state: StateWithContext) =>
  state.matches("AUTHORIZATION_CANCELLED");

export const selectFailureOption = (state: StateWithContext) =>
  state.context.failure;

export const selectTransactionData = (state: StateWithContext) =>
  pipe(state.context.transactionData, O.toUndefined);
