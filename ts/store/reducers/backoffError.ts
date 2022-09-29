import * as O from "fp-ts/lib/Option";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { getType } from "typesafe-actions";
import _ from "lodash";
import * as AR from "fp-ts/lib/Array";
import { pipe } from "fp-ts/lib/function";
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
  const keyToRemove = AR.lookup(successIndex, failureActionTypes());
  if (O.isSome(keyToRemove) && keyToRemove.value in state) {
    // remove the previous record
    return _.omit(state, keyToRemove.value);
  }
  return state;
};

// return the waiting time from a given failure action
export const backOffWaitingTime =
  (state: GlobalState) =>
  (failure: FailureActions): Millisecond =>
    pipe(
      state.backoffError[getType(failure)],
      O.fromNullable,
      O.fold(
        () => 0 as Millisecond,
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
      )
    );

export default reducer;
