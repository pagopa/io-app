import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import { idPayGenerateBarcode } from "../actions";
import { IdPayBarcodeState } from "../types";

const INITIAL_STATE: IdPayBarcodeState = {};

const barcodeReducer = (
  state: IdPayBarcodeState = INITIAL_STATE,
  action: Action
): IdPayBarcodeState => {
  switch (action.type) {
    case getType(idPayGenerateBarcode.request):
      return {
        ...state,
        [action.payload.initiativeId]: pipe(
          state[action.payload.initiativeId],
          O.fromNullable,
          O.fold(() => pot.noneLoading, pot.toLoading)
        )
      };
    case getType(idPayGenerateBarcode.success):
      return {
        ...state,
        [action.payload.initiativeId]: pot.some(action.payload)
      };
    case getType(idPayGenerateBarcode.failure):
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

export { barcodeReducer };
