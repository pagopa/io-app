import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import { NetworkError } from "../../../../../utils/errors";

import { WalletApplicationStatusEnum } from "../../../../../../definitions/pagopa/walletv3/WalletApplicationStatus";
import { WalletInfo } from "../../../../../../definitions/pagopa/walletv3/WalletInfo";
import {
  paymentsGetMethodDetailsAction,
  paymentsTogglePagoPaCapabilityAction
} from "../actions";

export type PaymentsMethodDetailsState = {
  walletDetails: pot.Pot<WalletInfo, NetworkError>;
};

const INITIAL_STATE: PaymentsMethodDetailsState = {
  walletDetails: pot.noneLoading
};

const reducer = (
  state: PaymentsMethodDetailsState = INITIAL_STATE,
  action: Action
): PaymentsMethodDetailsState => {
  switch (action.type) {
    // GET WALLET DETAILS
    case getType(paymentsGetMethodDetailsAction.request):
      return {
        ...state,
        walletDetails: pot.toLoading(pot.none)
      };
    case getType(paymentsGetMethodDetailsAction.success):
      return {
        ...state,
        walletDetails: pot.some(action.payload)
      };
    case getType(paymentsGetMethodDetailsAction.failure):
      return {
        ...state,
        walletDetails: pot.toError(state.walletDetails, action.payload)
      };
    case getType(paymentsGetMethodDetailsAction.cancel):
      return {
        ...state,
        walletDetails: pot.none
      };
    // TOGGLE PAGOPA CAPABILITY
    case getType(paymentsTogglePagoPaCapabilityAction.success):
      const walletDetails = pot.getOrElse(
        state.walletDetails,
        {} as WalletInfo
      );
      const updatedApplications = walletDetails.applications.map(
        application => {
          if (application.name === "PAGOPA") {
            return {
              ...application,
              status:
                application.status === WalletApplicationStatusEnum.ENABLED
                  ? WalletApplicationStatusEnum.DISABLED
                  : WalletApplicationStatusEnum.ENABLED
            };
          }
          return application;
        }
      );
      return {
        ...state,
        walletDetails: pot.some({
          ...walletDetails,
          applications: updatedApplications
        })
      };
  }
  return state;
};

export default reducer;
