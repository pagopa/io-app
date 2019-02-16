/**
 * A reducer to store the services normalized by id
 * It only manages SUCCESS actions because all UI state properties (like * loading/error)
 * are managed by different global reducers.
 */

import { RptIdFromString } from "io-pagopa-commons/lib/pagopa";
import { getType } from "typesafe-actions";

import { clearCache } from "../../actions/profile";
import { Action } from "../../actions/types";
import { paymentCompletedSuccess } from "../../actions/wallet/payment";
import { GlobalState } from "../types";

type PaidReason = Readonly<
  | {
      kind: "COMPLETED";
      transactionId: number;
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

const INITIAL_STATE: PaymentByRptIdState = {};

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
                transactionId: action.payload.transaction.id
              }
            : {
                kind: "DUPLICATED"
              }
      };

    case getType(clearCache):
      return INITIAL_STATE;

    default:
      return state;
  }
};

// Selectors

export const paymentsByRptIdSelector = (state: GlobalState) =>
  state.entities.paymentByRptId;
