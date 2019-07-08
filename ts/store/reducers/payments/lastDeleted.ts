import { RptId } from "italia-pagopa-commons/lib/pagopa";
import { getType } from "typesafe-actions";
import { paymentsLastDeletedSet } from "../../actions/payments";
import { Action } from "../../actions/types";
import { GlobalState } from "../types";

export type PaymentsLastDeletedInfo = {
  // Timestamp
  at: number;
  rptId: RptId;
  idPayment: string;
};

export type PaymentsLastDeletedState = PaymentsLastDeletedInfo | null;

const INITIAL_STATE: PaymentsLastDeletedState = null;

export const paymentsLastDeletedStateSelector = (state: GlobalState) =>
  state.payments.lastDeleted;

/**
 * Store info about the laste deleted patmeny
 */
const paymentsLastDeletedReducer = (
  state: PaymentsLastDeletedState = INITIAL_STATE,
  action: Action
): PaymentsLastDeletedState => {
  switch (action.type) {
    case getType(paymentsLastDeletedSet):
      return { ...action.payload };

    default:
      return state;
  }
};

export default paymentsLastDeletedReducer;
