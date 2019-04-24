import { getType } from "typesafe-actions";

import { none, Option, some } from "fp-ts/lib/Option";
import { Millisecond } from "italia-ts-commons/lib/units";
import {
  navigationHistoryEmpty,
  navigationHistoryPush
} from "../actions/navigationHistory";
import { Action } from "../actions/types";

export type ExitAppState = Readonly<{
  exitRequestTime: Option<Millisecond>;
}>;

const INITIAL_STATE: ExitAppState = {
  exitRequestTime: none
};

export function exitAppReducer(
  state: ExitAppState = INITIAL_STATE,
  action: Action
): ExitAppState {
  switch (action.type) {
    // when the history is empty the app is eligible to exit
    // exitRequestTime contains the current time value in milliseconds
    case getType(navigationHistoryEmpty): {
      const now = new Date().getTime() as Millisecond;
      return {
        ...state,
        exitRequestTime: some(now)
      };
    }

    // when a history is pushed the app is never eligible to exit
    case getType(navigationHistoryPush):
      return {
        ...state,
        exitRequestTime: none
      };
  }

  return state;
}
