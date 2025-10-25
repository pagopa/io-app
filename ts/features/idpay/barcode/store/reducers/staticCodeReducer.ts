import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import { idPayGenerateStaticCode } from "../actions";
import { IdPayStaticCodeState } from "../types";

const INITIAL_STATIC_CODE_STATE: IdPayStaticCodeState = pot.none;

const staticCodeReducer = (
  state: IdPayStaticCodeState = INITIAL_STATIC_CODE_STATE,
  action: Action
): IdPayStaticCodeState => {
  switch (action.type) {
    case getType(idPayGenerateStaticCode.request):
      return pot.toLoading(state);
    case getType(idPayGenerateStaticCode.success):
      return pot.some(action.payload);
    case getType(idPayGenerateStaticCode.failure):
      return pot.toError(state, action.payload.error);
  }
  return state;
};

export { staticCodeReducer };
