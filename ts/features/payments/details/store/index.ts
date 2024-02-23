import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import { NetworkError } from "../../../../utils/errors";

import { ServiceNameEnum } from "../../../../../definitions/pagopa/walletv3/ServiceName";
import { ServiceStatusEnum } from "../../../../../definitions/pagopa/walletv3/ServiceStatus";
import { WalletInfo } from "../../../../../definitions/pagopa/walletv3/WalletInfo";
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
              service.status === ServiceStatusEnum.ENABLED
                ? ServiceStatusEnum.DISABLED
                : ServiceStatusEnum.ENABLED
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
  state.features.payments.details;

export const walletDetailsInstrumentPotSelector = (state: GlobalState) =>
  walletDetailsSelector(state).walletDetails;

export const walletDetailsInstrumentSelector = (state: GlobalState) =>
  pot.toUndefined(walletDetailsSelector(state).walletDetails);

export const isLoadingWalletInstrumentSelector = (state: GlobalState) =>
  pot.isLoading(walletDetailsSelector(state).walletDetails);

export const isErrorWalletInstrumentSelector = (state: GlobalState) =>
  pot.isError(walletDetailsSelector(state).walletDetails);

export default walletDetailsReducer;
