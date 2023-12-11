import * as pot from "@pagopa/ts-commons/lib/pot";
import * as _ from "lodash";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import { NetworkError } from "../../../../utils/errors";
import { GlobalState } from "../../../../store/reducers/types";
import { WalletInfo } from "../../../../../definitions/pagopa/walletv3/WalletInfo";

import { ServiceNameEnum } from "../../../../../definitions/pagopa/walletv3/ServiceName";
import { WalletServiceStatusEnum } from "../../../../../definitions/pagopa/walletv3/WalletServiceStatus";
import {
  walletDetailsGetInstrument,
  walletDetailsPagoPaCapabilityToggle
} from "./actions";

export type WalletDetailsState = {
  walletDetails: pot.Pot<WalletInfo, NetworkError>;
};

const INITIAL_STATE: WalletDetailsState = {
  walletDetails: pot.noneLoading
};

const walletDetailsReducer = (
  state: WalletDetailsState = INITIAL_STATE,
  action: Action
): WalletDetailsState => {
  switch (action.type) {
    // GET WALLET DETAILS
    case getType(walletDetailsGetInstrument.request):
      return {
        ...state,
        walletDetails: pot.toLoading(pot.none)
      };
    case getType(walletDetailsGetInstrument.success):
      return {
        ...state,
        walletDetails: pot.some(action.payload)
      };
    case getType(walletDetailsGetInstrument.failure):
      return {
        ...state,
        walletDetails: pot.toError(state.walletDetails, action.payload)
      };
    case getType(walletDetailsGetInstrument.cancel):
      return {
        ...state,
        walletDetails: pot.none
      };
    // TOGGLE PAGOPA CAPABILITY
    case getType(walletDetailsPagoPaCapabilityToggle.success):
      const walletDetails = pot.getOrElse(
        state.walletDetails,
        {} as WalletInfo
      );
      const updatedServices = walletDetails.services.map(service => {
        if (service.name === ServiceNameEnum.PAGOPA) {
          return {
            ...service,
            status:
              service.status === WalletServiceStatusEnum.ENABLED
                ? WalletServiceStatusEnum.DISABLED
                : WalletServiceStatusEnum.ENABLED
          };
        }
        return service;
      });
      return {
        ...state,
        walletDetails: pot.some({
          ...walletDetails,
          services: updatedServices
        })
      };
  }
  return state;
};

const walletDetailsSelector = (state: GlobalState) =>
  state.features.wallet.details;

export const walletDetailsInstrumentPotSelector = createSelector(
  walletDetailsSelector,
  details => details.walletDetails
);

export const walletDetailsInstrumentSelector = createSelector(
  walletDetailsInstrumentPotSelector,
  details => pot.toUndefined(details)
);

export const isLoadingWalletInstrumentSelector = createSelector(
  walletDetailsInstrumentPotSelector,
  walletInstrument => pot.isLoading(walletInstrument)
);

export const isErrorWalletInstrumentSelector = createSelector(
  walletDetailsInstrumentPotSelector,
  walletInstrument => pot.isError(walletInstrument)
);

export default walletDetailsReducer;
