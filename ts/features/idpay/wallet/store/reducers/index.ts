import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { WalletDTO } from "../../../../../../definitions/idpay/wallet/WalletDTO";
import { Action } from "../../../../../store/actions/types";
import { GlobalState } from "../../../../../store/reducers/types";
import { NetworkError } from "../../../../../utils/errors";
import { idPayWalletGet, idPayWalletInitiativesGet } from "../actions";
import { InitiativesWithInstrumentDTO } from "../../../../../../definitions/idpay/wallet/InitiativesWithInstrumentDTO";

export type IDPayWalletState = {
  initiatives: pot.Pot<WalletDTO, NetworkError>;
  initiativesWithInstrument: pot.Pot<
    InitiativesWithInstrumentDTO,
    NetworkError
  >;
};

const INITIAL_STATE: IDPayWalletState = {
  initiatives: pot.none,
  initiativesWithInstrument: pot.none
};

const reducer = (
  state: IDPayWalletState = INITIAL_STATE,
  action: Action
): IDPayWalletState => {
  switch (action.type) {
    case getType(idPayWalletGet.request):
      return { ...state, initiatives: pot.toLoading(state.initiatives) };
    case getType(idPayWalletGet.success):
      return { ...state, initiatives: pot.some(action.payload) };
    case getType(idPayWalletGet.failure):
      return {
        ...state,
        initiatives: pot.toError(state.initiatives, action.payload)
      };
    // Initiatives with instrument
    case getType(idPayWalletInitiativesGet.request):
      return {
        ...state,
        initiativesWithInstrument: pot.toLoading(
          state.initiativesWithInstrument
        )
      };
    case getType(idPayWalletInitiativesGet.success):
      return {
        ...state,
        initiativesWithInstrument: pot.some(action.payload)
      };
    case getType(idPayWalletInitiativesGet.failure):
      return {
        ...state,
        initiativesWithInstrument: pot.toError(
          state.initiativesWithInstrument,
          action.payload
        )
      };
  }
  return state;
};

export const idPayWalletSelector = (state: GlobalState) =>
  state.features.idPay.wallet;
export const idPayWalletInitiativeListSelector = (state: GlobalState) =>
  pot.map(state.features.idPay.wallet.initiatives, w => w.initiativeList);

const idPayWalletInitiativesWithInstrumentSelector = (state: GlobalState) =>
  pot.map(state.features.idPay.wallet.initiativesWithInstrument, w => w);
const idPayWalletInitiativesListWithInstrumentSelector = (state: GlobalState) =>
  pot.map(
    state.features.idPay.wallet.initiativesWithInstrument,
    w => w.initiativeList
  );


export default reducer;
