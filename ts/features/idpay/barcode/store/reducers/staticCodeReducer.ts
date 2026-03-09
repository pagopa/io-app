import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
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
    case getType(idPayGenerateStaticCode.request):
      return {
        ...state,
        [action.payload.initiativeId]: pipe(
          state[action.payload.initiativeId],
          O.fromNullable,
          O.fold(() => pot.noneLoading, pot.toLoading)
        )
      };
    case getType(idPayGenerateStaticCode.success):
      return {
        ...state,
        [action.payload.initiativeId]: pot.some(action.payload)
      };
    case getType(idPayGenerateStaticCode.failure):
      return {
        ...state,
        [action.payload.initiativeId]: pot.toError(
          state[action.payload.initiativeId],
          action.payload.error
        )
      };
  }
  return state;
};

export { staticCodeReducer };
