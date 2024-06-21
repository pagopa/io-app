import _ from "lodash";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { createSelector } from "reselect";
import { GlobalState } from "../../../../../store/reducers/types";
import { latestTransactionsSelector } from "../../../../../store/reducers/wallet/transactions";

const walletTransactionSelector = (state: GlobalState) =>
  state.features.payments.transaction;

export const walletTransactionDetailsPotSelector = (state: GlobalState) =>
  walletTransactionSelector(state).details;

export const isPaymentsLegacyTransactionsEmptySelector = createSelector(
  latestTransactionsSelector,
  transactionsPot =>
    pot.getOrElse(
      pot.map(
        transactionsPot,
        transactions => _.values(transactions).length === 0
      ),
      false
    )
);
