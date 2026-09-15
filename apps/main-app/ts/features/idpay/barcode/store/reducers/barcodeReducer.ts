import * as pot from "@pagopa/ts-commons/lib/pot";
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
    case getType(idPayGenerateBarcode.failure):
      return {
        ...state,
        [action.payload.initiativeId]: pot.toError(
          state[action.payload.initiativeId],
          action.payload.error
        )
      };
    case getType(idPayGenerateBarcode.request):
      return {
        ...state,
        [action.payload.initiativeId]: state[action.payload.initiativeId]
          ? pot.toLoading(state[action.payload.initiativeId])
          : pot.noneLoading
      };
    case getType(idPayGenerateBarcode.success):
      return {
        ...state,
        [action.payload.initiativeId]: pot.some(action.payload)
      };
  }
  return state;
};

export { barcodeReducer };
