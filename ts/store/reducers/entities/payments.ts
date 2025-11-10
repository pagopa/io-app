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
import {
  updatePaymentForMessage,
  UpdatePaymentForMessageFailure
} from "../../../features/messages/store/actions";
import { isPaidPaymentFromDetailV2Enum } from "../../../utils/payment";
import { isMessageSpecificError } from "../../../features/messages/types/paymentErrors";

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
    // This action is dispatched by the payment status update saga that is triggered upon
    // entering message details. Be aware that the status of a paid payment can never change,
    // so there is no need to handle the removal of a no-more-paid payment from the state
    case getType(updatePaymentForMessage.failure):
      return paymentByRptIdStateFromUpdatePaymentForMessageFailure(
        action.payload,
        state
      );
    // clear state if the current profile is different from the previous one
    case getType(differentProfileLoggedIn):
      return INITIAL_STATE;

    default:
      return state;
  }
};

const paymentByRptIdStateFromUpdatePaymentForMessageFailure = (
  payload: UpdatePaymentForMessageFailure,
  state: PaymentByRptIdState
): PaymentByRptIdState => {
  // Only paid payments are tracked from the reducer, ignore the others
  const isPaidPayment =
    isMessageSpecificError(payload.reason) &&
    isPaidPaymentFromDetailV2Enum(payload.reason.details);
  if (!isPaidPayment) {
    return state;
  }
  const rptId = payload.paymentId;
  // Make sure not to overwrite any existing data (since it may
  // have come from a payment flow, where data are more detailed)
  const inMemoryPaymentData = state[rptId];
  if (inMemoryPaymentData != null) {
    return state;
  }
  // Paid payment was not tracked, add it to the reducer's state
  return {
    ...state,
    [rptId]: {
      kind: "DUPLICATED"
    }
  };
};

// Selectors

export const paymentsByRptIdSelector = (
  state: GlobalState
): PaymentByRptIdState => state.entities.paymentByRptId;
