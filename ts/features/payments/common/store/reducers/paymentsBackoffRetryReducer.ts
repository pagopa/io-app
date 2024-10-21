import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import {
  clearPaymentsBackoffRetry,
  increasePaymentsBackoffRetry
} from "../actions";
import { PAYMENTS_BACKOFF_SECONDS_DELAYS } from "../../utils/backoffRetry";
import { PaymentsBackoffRetryValue } from "../../utils/types";

export type PaymentsBackoffRetryState = {
  [key: string]: PaymentsBackoffRetryValue | undefined;
};

const INITIAL_STATE: PaymentsBackoffRetryState = {};

const reducer = (
  state: PaymentsBackoffRetryState = INITIAL_STATE,
  action: Action
): PaymentsBackoffRetryState => {
  switch (action.type) {
    case getType(increasePaymentsBackoffRetry):
      const retryCount =
        state[action.payload]?.retryCount === undefined
          ? 0
          : (state[action.payload]?.retryCount || 0) + 1;
      return {
        ...state,
        [action.payload]: {
          retryCount,
          allowedRetryTimestamp:
            Date.now() + PAYMENTS_BACKOFF_SECONDS_DELAYS[retryCount] * 1000
        }
      };
    case getType(clearPaymentsBackoffRetry):
      if (!state[action.payload]) {
        return state;
      }
      return {
        ...state,
        [action.payload]: undefined
      };
  }
  return state;
};

export default reducer;
