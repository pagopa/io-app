import { fromNullable } from "fp-ts/lib/Option";
import { Millisecond } from "italia-ts-commons/lib/units";
import { getType } from "typesafe-actions";
import _ from "lodash";
import { index } from "fp-ts/lib/Array";
import { Action } from "../actions/types";
import { computedProp } from "../../types/utils";
import { GlobalState } from "./types";
import {
  FailureActions,
  failureActionTypes,
  successActionTypes,
  backoffConfig
} from "./backoffErrorConfig";

export type BackoffErrorState = {
  [key: string]: {
    lastUpdate: Date;
    attempts: number;
  };
};

const defaultState: BackoffErrorState = {};

const reducer = (
  state: BackoffErrorState = defaultState,
  action: Action
): BackoffErrorState => {
  const failure = failureActionTypes().find(a => a === action.type);
  if (failure) {
    return {
      ...state,
      ...computedProp(failure, {
        lastUpdate: new Date(),
        attempts: Math.min(
          (state[failure]?.attempts ?? 0) + 1,
          backoffConfig().maxAttempts
        )
      })
    };
  }
  const successIndex = successActionTypes().indexOf(action.type);
  // the failure type is that one at the same index of success type
  const keyToRemove = index(successIndex, failureActionTypes());
  if (keyToRemove.isSome() && keyToRemove.value in state) {
    // remove the previous record
    return _.omit(state, keyToRemove.value);
  }
  return state;
};

// return the waiting time from a given failure action
export const backOffWaitingTime =
  (state: GlobalState) =>
  (failure: FailureActions): Millisecond =>
    fromNullable(state.backoffError[getType(failure)]).fold(
      0 as Millisecond,
      lastError => {
        const wait =
          Math.pow(backoffConfig().base, lastError.attempts) *
          backoffConfig().mul;
        // if the last attempt is older that wait -> no wait
        return (
          new Date().getTime() - lastError.lastUpdate.getTime() < wait
            ? wait
            : 0
        ) as Millisecond;
      }
    );

export default reducer;
