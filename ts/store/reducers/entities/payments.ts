/**
 * A reducer to store the services normalized by id
 * It only manages SUCCESS actions because all UI state properties (like * loading/error)
 * are managed by different global reducers.
 */

import { getType } from "typesafe-actions";
import { RptIdFromString } from "@pagopa/io-pagopa-commons/lib/pagopa";
import { createSelector } from "reselect";

import { Action } from "../../actions/types";
import { paymentCompletedSuccess } from "../../actions/wallet/payment";
import { GlobalState } from "../types";
import { differentProfileLoggedIn } from "../../actions/crossSessions";
import { UIMessage } from "./messages/types";

export type PaidReason = Readonly<
  | {
      kind: "COMPLETED";
      // TODO Transaction is not available, add it when PM makes it available again
      // see https://pagopa.atlassian.net/browse/IA-227
      transactionId: number | undefined;
    }
  | {
      kind: "DUPLICATED";
    }
>;

/**
 * Maps a paid rptId to the resulting completed transaction ID
 */
export type PaymentByRptIdState = Readonly<{
  [key: string]: PaidReason | undefined;
}>;

export const INITIAL_STATE: PaymentByRptIdState = {};

export const paymentByRptIdReducer = (
  state: PaymentByRptIdState = INITIAL_STATE,
  action: Action
): PaymentByRptIdState => {
  switch (action.type) {
    case getType(paymentCompletedSuccess):
      // Use the ID as object key
      const rptIdString: string = RptIdFromString.encode(action.payload.rptId);
      return {
        ...state,
        [rptIdString]:
          action.payload.kind === "COMPLETED"
            ? {
                kind: "COMPLETED",
                transactionId: action.payload.transaction?.id
              }
            : {
                kind: "DUPLICATED"
              }
      };
    // clear state if the current profile is different from the previous one
    case getType(differentProfileLoggedIn):
      return INITIAL_STATE;

    default:
      return state;
  }
};

// Selectors

export const paymentsByRptIdSelector = (
  state: GlobalState
): PaymentByRptIdState => state.entities.paymentByRptId;

/**
 * Given an rptId as a string, return true if there is a matching paid transaction.
 * TODO: just a placeholder for now, see https://pagopa.atlassian.net/browse/IA-417
 */
export const isNoticePaid = createSelector(
  [
    paymentsByRptIdSelector,
    (_: GlobalState, category: UIMessage["category"]) => category
  ],
  (paymentByRptId, category) => {
    if (category.tag === "PAYMENT") {
      return !!paymentByRptId[category.rptId];
    }
    return false;
  }
);
