import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { TransactionBarCodeResponse } from "../../../../../definitions/idpay/TransactionBarCodeResponse";
import { TransactionErrorDTO } from "../../../../../definitions/idpay/TransactionErrorDTO";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import { NetworkError } from "../../../../utils/errors";
import { calculateIdPayBarcodeSecondsToExpire } from "../utils";
import { idPayGenerateBarcode } from "./actions";

export type IdPayBarcodeState = {
  [initiativeId: string]: pot.Pot<
    TransactionBarCodeResponse,
    TransactionErrorDTO | NetworkError
  >;
};

const INITIAL_STATE: IdPayBarcodeState = {};

const reducer = (
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

// -------------------- SELECTORS ----------------------

const idPayBarcodeSelector = (state: GlobalState): IdPayBarcodeState =>
  state.features.idPay.barcode;

export const idPayBarcodeByInitiativeIdSelector = createSelector(
  idPayBarcodeSelector,
  state => (initiativeId: string) => state[initiativeId] ?? pot.none
  // type checker does not complain if the null check is removed, but
  // since it's a map access it could very well return undefined
);

// gracefully failing expire time selector
export const idPayBarcodeSecondsTillExpireSelector = createSelector(
  idPayBarcodeByInitiativeIdSelector,
  getInitiative => (initiativeId: string) =>
    pipe(
      pot.map(getInitiative(initiativeId), barcode =>
        calculateIdPayBarcodeSecondsToExpire(barcode)
      ),
      seconds => pot.getOrElse(seconds, 0)
    )
);

export default reducer;
