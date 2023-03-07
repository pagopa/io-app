import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { WalletDTO } from "../../../../../../definitions/idpay/WalletDTO";
import { Action } from "../../../../../store/actions/types";
import { GlobalState } from "../../../../../store/reducers/types";
import { NetworkError } from "../../../../../utils/errors";
import { idPayWalletGet } from "../actions";

export type IDPayWalletState = pot.Pot<WalletDTO, NetworkError>;

const INITIAL_STATE: IDPayWalletState = pot.none;

const reducer = (
  state: IDPayWalletState = INITIAL_STATE,
  action: Action
): IDPayWalletState => {
  switch (action.type) {
    case getType(idPayWalletGet.request):
      return pot.toLoading(state);
    case getType(idPayWalletGet.success):
      return pot.some(action.payload);
    case getType(idPayWalletGet.failure):
      return pot.toError(state, action.payload);
  }
  return state;
};

export const idPayWalletSelector = (state: GlobalState) =>
  state.features.idPay.wallet;
export const idPayWalletInitiativeListSelector = (state: GlobalState) =>
  pot.map(state.features.idPay.wallet, w => w.initiativeList);

export default reducer;
