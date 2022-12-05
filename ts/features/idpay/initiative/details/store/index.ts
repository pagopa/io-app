import * as pot from "@pagopa/ts-commons/lib/pot";
import { ActionType, createAsyncAction, getType } from "typesafe-actions";
import { InitiativeDTO } from "../../../../../../definitions/idpay/wallet/InitiativeDTO";
import { Action } from "../../../../../store/actions/types";
import { GlobalState } from "../../../../../store/reducers/types";
import { NetworkError } from "../../../../../utils/errors";

export type IdPayInitiativeGetPayloadType = { initiativeId: string };
export const idpayInitiativeGet = createAsyncAction(
  "IDPAY_INITIATIVE_DETAILS_REQUEST",
  "IDPAY_INITIATIVE_DETAILS_SUCCESS",
  "IDPAY_INITIATIVE_DETAILS_FAILURE"
)<IdPayInitiativeGetPayloadType, InitiativeDTO, NetworkError>();

export type IDPayInitiativeActions = ActionType<typeof idpayInitiativeGet>;

export type IDPayInitiativeState = {
  details: pot.Pot<InitiativeDTO, NetworkError>;
};

const INITIAL_STATE: IDPayInitiativeState = {
  details: pot.none
};

const reducer = (
  state: IDPayInitiativeState = INITIAL_STATE,
  action: Action
): IDPayInitiativeState => {
  switch (action.type) {
    case getType(idpayInitiativeGet.request):
      return {
        details: pot.toLoading(state.details)
      };
    case getType(idpayInitiativeGet.success):
      return {
        details: pot.some(action.payload)
      };
    case getType(idpayInitiativeGet.failure):
      return {
        details: pot.toError(state.details, action.payload)
      };
  }
  return state;
};

export const idpayInitiativeDetailsSelector = (state: GlobalState) =>
  state.features.idPay.initiative.details;

export default reducer;
