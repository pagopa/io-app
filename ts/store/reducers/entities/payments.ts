/**
 * A reducer to store the services normalized by id
 * It only manages SUCCESS actions because all UI state properties (like * loading/error)
 * are managed by different global reducers.
 */
import { getType } from "typesafe-actions";
import { Action } from "../../actions/types";
import { paymentCompletedSuccess } from "../../../features/payments/checkout/store/actions/orchestration";
import { GlobalState } from "../types";
import { differentProfileLoggedIn } from "../../actions/crossSessions";

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
      return {
        ...state,
        [action.payload.rptId]: {
          kind: action.payload.kind,
          // The transaction ID is not available with the PM, it will be added when migrated to the NPG that will support it
          transactionId: undefined
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
