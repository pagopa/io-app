import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";

import { Action } from "../../../../../store/actions/types";
import { idPayGenerateStaticCode } from "../actions";
import { IdPayStaticCodeState } from "../types";

const INITIAL_STATIC_CODE_STATE: IdPayStaticCodeState = {};

const staticCodeReducer = (
  state: IdPayStaticCodeState = INITIAL_STATIC_CODE_STATE,
  action: Action
): IdPayStaticCodeState => {
  switch (action.type) {
    case getType(idPayGenerateStaticCode.failure):
      return {
        ...state,
        [action.payload.initiativeId]: pot.toError(
          state[action.payload.initiativeId],
          action.payload.error
        )
      };
    case getType(idPayGenerateStaticCode.request):
      return {
        ...state,
        [action.payload.initiativeId]: state[action.payload.initiativeId]
          ? pot.toLoading(state[action.payload.initiativeId])
          : pot.noneLoading
      };
    case getType(idPayGenerateStaticCode.success):
      return {
        ...state,
        [action.payload.initiativeId]: pot.some(action.payload)
      };
  }
  return state;
};

export { staticCodeReducer };
