import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import { NetworkError } from "../../../../../utils/errors";
import { getPaymentsWalletUserMethods } from "../actions";
import { Wallets } from "../../../../../../definitions/pagopa/walletv3/Wallets";
import { paymentsDeleteMethodAction } from "../../../details/store/actions";

export type PaymentsWalletState = {
  userMethods: pot.Pot<Wallets, NetworkError>;
};

const INITIAL_STATE: PaymentsWalletState = {
  userMethods: pot.noneLoading
};

const paymentsWalletReducer = (
  state: PaymentsWalletState = INITIAL_STATE,
  action: Action
): PaymentsWalletState => {
  switch (action.type) {
    case getType(getPaymentsWalletUserMethods.request):
      return {
        ...state,
        userMethods: pot.toLoading(state.userMethods)
      };
    case getType(getPaymentsWalletUserMethods.success):
      return {
        ...state,
        userMethods: pot.some(action.payload)
      };
    case getType(getPaymentsWalletUserMethods.failure):
      return {
        ...state,
        userMethods: pot.toError(state.userMethods, action.payload)
      };

    // If method removed with success, remove it from the current list
    case getType(paymentsDeleteMethodAction.success):
      return {
        ...state,
        userMethods: pot.map(state.userMethods, ({ wallets }) => ({
          wallets: wallets?.filter(w => w.walletId !== action.payload)
        }))
      };
  }
  return state;
};

export default paymentsWalletReducer;
