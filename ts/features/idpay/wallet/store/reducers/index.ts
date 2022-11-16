import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { WalletDTO } from "../../../../../../definitions/idpay/wallet/WalletDTO";
import { Action } from "../../../../../store/actions/types";
import { GlobalState } from "../../../../../store/reducers/types";
import { NetworkError } from "../../../../../utils/errors";
import { idPayWalletGet } from "../actions";

export type IDPayState = {
  wallet: pot.Pot<WalletDTO, NetworkError>;
};

const INITIAL_STATE: IDPayState = {
  wallet: pot.none
};

const reducer = (
  state: IDPayState = INITIAL_STATE,
  action: Action
): IDPayState => {
  switch (action.type) {
    case getType(idPayWalletGet.request):
      return {
        ...state,
        wallet: pot.toLoading(state.wallet)
      };
    case getType(idPayWalletGet.success):
      return {
        ...state,
        wallet: pot.some(action.payload)
      };
    case getType(idPayWalletGet.failure):
      return {
        ...state,
        wallet: pot.toError(state.wallet, action.payload)
      };
  }
  return state;
};

export const idPayWalletSelector = (state: GlobalState) =>
  state.features.idpay.wallet;
export const idPayWalletInitiativeListSelector = (state: GlobalState) =>
  pot.map(state.features.idpay.wallet, w => w.initiativeList);

export default reducer;
