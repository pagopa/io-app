import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import { NetworkError } from "../../../../../utils/errors";
import { getPaymentsWalletUserMethods } from "../actions";
import { Wallets } from "../../../../../../definitions/pagopa/walletv3/Wallets";

export type PaymentsWalletState = {
  userMethods: pot.Pot<Wallets, NetworkError>;
};

const INITIAL_STATE: PaymentsWalletState = {
  userMethods: pot.none
};

const paymentsWalletReducer = (
  state: PaymentsWalletState = INITIAL_STATE,
  action: Action
): PaymentsWalletState => {
  switch (action.type) {
    case getType(getPaymentsWalletUserMethods.request):
      return {
        ...state,
        userMethods: pot.toLoading(pot.none)
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
  }
  return state;
};

export default paymentsWalletReducer;
