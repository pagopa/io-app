import { Omit } from "@pagopa/ts-commons/lib/types";
import { getType } from "typesafe-actions";
import { RptId } from "@pagopa/io-pagopa-commons/lib/pagopa";

import { Action } from "../../actions/types";
import {
  paymentCompletedSuccess,
  paymentIdPolling,
  paymentInitializeState,
  paymentVerifica
} from "../../actions/wallet/payment";
import { GlobalState } from "../types";

type WithoutKind<T extends { kind: string }> = Omit<T, "kind">;

export type PaymentUnstartedState = {
  kind: "UNSTARTED";
};

export type PaymentInitializedState = WithoutKind<PaymentUnstartedState> & {
  kind: "INITIALIZED";
  initializationData: {
    rptId: RptId;
  };
};

export type PaymentActivatedState = WithoutKind<PaymentInitializedState> & {
  kind: "ACTIVATED";
  activationData: {
    idPayment: string;
  };
};

const INITIAL_STATE: PaymentsCurrentState = {
  kind: "UNSTARTED"
};

export const paymentsCurrentStateSelector = (state: GlobalState) =>
  state.payments.current;

export type PaymentsCurrentState =
  | PaymentUnstartedState
  | PaymentInitializedState
  | PaymentActivatedState;

const paymentsCurrentReducer = (
  state: PaymentsCurrentState = INITIAL_STATE,
  action: Action
): PaymentsCurrentState => {
  switch (action.type) {
    case getType(paymentVerifica.request): {
      if (state.kind === "UNSTARTED") {
        return {
          ...state,
          kind: "INITIALIZED",
          initializationData: {
            rptId: action.payload.rptId
          }
        };
      }

      return state;
    }

    case getType(paymentIdPolling.success): {
      if (state.kind === "INITIALIZED") {
        return {
          ...state,
          kind: "ACTIVATED",
          activationData: {
            idPayment: action.payload
          }
        };
      }

      return state;
    }

    case getType(paymentInitializeState):
    case getType(paymentCompletedSuccess):
      return {
        kind: "UNSTARTED"
      };

    default:
      return state;
  }
};

export default paymentsCurrentReducer;
