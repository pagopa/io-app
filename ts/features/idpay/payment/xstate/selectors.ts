import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { createSelector } from "reselect";
import { StateFrom } from "xstate";
import { LOADING_TAG, WAITING_USER_INPUT_TAG } from "../../../../utils/xstate";
import { IDPayPaymentMachineType } from "./machine";

type StateWithContext = StateFrom<IDPayPaymentMachineType>;

const selectTags = (state: StateWithContext) => state.tags;

export const isLoadingSelector = createSelector(selectTags, tags =>
  tags.has(LOADING_TAG)
);

export const isAwaitingUserInputSelector = createSelector(selectTags, tags =>
  tags.has(WAITING_USER_INPUT_TAG)
);

export const selectIsFailure = (state: StateWithContext) =>
  state.matches("PAYMENT_FAILURE");

const selectTransactionData = (state: StateWithContext) =>
  state.context.transactionData;

export const transactionDataSelector = createSelector(
  selectTransactionData,
  data =>
    pipe(
      data,
      O.filter(E.isRight),
      O.map(data => data.right),
      O.toUndefined
    )
);

export const failureSelector = createSelector(selectTransactionData, data =>
  pipe(
    data,
    O.filter(E.isLeft),
    O.map(data => data.left),
    O.toUndefined
  )
);
