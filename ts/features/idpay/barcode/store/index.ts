import { pot } from "@pagopa/ts-commons";
import { createSelector } from "reselect";
import { ActionType, createAsyncAction, getType } from "typesafe-actions";
import { TransactionBarCodeResponse } from "../../../../../definitions/idpay/TransactionBarCodeResponse";
import { TransactionErrorDTO } from "../../../../../definitions/idpay/TransactionErrorDTO";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import { NetworkError } from "../../../../utils/errors";

export type IdPayBarcodeState = {
  [initiativeId: string]: pot.Pot<
    Omit<TransactionBarCodeResponse, "initiativeId">,
    TransactionErrorDTO | NetworkError
  >;
};

const INITIAL_STATE: IdPayBarcodeState = {};

const reducer = (
  state: IdPayBarcodeState = INITIAL_STATE,
  action: Action
): IdPayBarcodeState => {
  switch (action.type) {
    case getType(idpayGenerateBarcode.request):
      return {
        ...state,
        [action.payload.initiativeId]: pot.toLoading(
          state[action.payload.initiativeId]
        )
      };
    case getType(idpayGenerateBarcode.success):
      return {
        ...state,
        [action.payload.initiativeId]: pot.some(action.payload)
      };
    case getType(idpayGenerateBarcode.failure):
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

const idpayBarcodeSelector = (state: GlobalState): IdPayBarcodeState =>
  state.features.idPay.barcode;

export const idpayBarcodeByInitiativeIdSelector = createSelector(
  idpayBarcodeSelector,
  state => (initiativeId: string) => state[initiativeId]
);
export const isIdpayBarcodeLoadingSelector = createSelector(
  idpayBarcodeByInitiativeIdSelector,
  getInitiative => (initiativeId: string) =>
    pot.isLoading(getInitiative(initiativeId))
);

// -------------------- EXPORTS -----------------------

export type IdpayGenerateBarcodePayload = {
  initiativeId: string;
};

export const idpayGenerateBarcode = createAsyncAction(
  "IDPAY_GENERATE_BARCODE_REQUEST",
  "IDPAY_GENERATE_BARCODE_SUCCESS",
  "IDPAY_GENERATE_BARCODE_FAILURE"
)<
  IdpayGenerateBarcodePayload,
  TransactionBarCodeResponse,
  { initiativeId: string; error: TransactionErrorDTO | NetworkError }
>();

export type IdPayBarcodeActions = ActionType<typeof idpayGenerateBarcode>;
export default reducer;
