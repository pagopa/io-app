import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { InitiativesWithInstrumentDTO } from "../../../../../../definitions/idpay/wallet/InitiativesWithInstrumentDTO";
import { WalletDTO } from "../../../../../../definitions/idpay/wallet/WalletDTO";
import { Action } from "../../../../../store/actions/types";
import { isIdPayEnabledSelector } from "../../../../../store/reducers/backendStatus";
import { GlobalState } from "../../../../../store/reducers/types";
import { NetworkError } from "../../../../../utils/errors";
import {
  idPayWalletGet,
  idPayWalletInitiativesGet,
  idpayInitiativesPairingDelete,
  idpayInitiativesPairingPut
} from "../actions";

export type IDPayWalletState = {
  initiatives: pot.Pot<WalletDTO, NetworkError>;
  initiativesWithInstrument: pot.Pot<
    InitiativesWithInstrumentDTO,
    NetworkError
  >;
  initiativesWithInstrumentPairingQueue: Record<string, boolean>;
  // structure: {initiativeId: are_we_wating_for_a_response_from_the_backend}
  // this will be populated on selection and reset when not loading and
  // we have a response from BE
};

const INITIAL_STATE: IDPayWalletState = {
  initiatives: pot.none,
  initiativesWithInstrument: pot.none,
  initiativesWithInstrumentPairingQueue: {}
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
      if (!action.payload.isRefreshCall) {
        return {
          ...state,
          initiativesWithInstrument: pot.toLoading(pot.none),
          initiativesWithInstrumentPairingQueue: {}
        };
      }
      break;
    case getType(idPayWalletInitiativesGet.success):
      const initiativesToKeepInLoadingState = pipe(
        state.initiativesWithInstrumentPairingQueue,
        Object.entries,
        entries => entries.filter(([_, value]) => value), // only get not loading ones
        Object.fromEntries
      );

      return {
        ...state,
        initiativesWithInstrument: pot.some(action.payload),
        initiativesWithInstrumentPairingQueue: initiativesToKeepInLoadingState
      };
    case getType(idPayWalletInitiativesGet.failure):
      return {
        ...state,
        initiativesWithInstrument: pot.toError(
          state.initiativesWithInstrument,
          action.payload
        )
      };
    // initiative pairing
    case getType(idpayInitiativesPairingDelete.request):
    case getType(idpayInitiativesPairingPut.request):
      return {
        ...state,
        initiativesWithInstrumentPairingQueue: {
          ...state.initiativesWithInstrumentPairingQueue,
          [action.payload.initiativeId]: true
        }
      };
    case getType(idpayInitiativesPairingDelete.success):
    case getType(idpayInitiativesPairingPut.success):
    case getType(idpayInitiativesPairingDelete.failure):
    case getType(idpayInitiativesPairingPut.failure):
      return {
        ...state,
        initiativesWithInstrumentPairingQueue: {
          ...state.initiativesWithInstrumentPairingQueue,
          [action.payload.initiativeId]: false
        }
      };
  }
  return state;
};

export const idPayWalletSelector = (state: GlobalState) =>
  state.features.idPay.wallet;
export const idPayWalletInitiativeListSelector = (state: GlobalState) =>
  pot.map(state.features.idPay.wallet.initiatives, w => w.initiativeList);

export const idPayWalletInitiativesWithInstrumentSelector = (
  state: GlobalState
) => pot.map(state.features.idPay.wallet.initiativesWithInstrument, w => w);
export const idPayWalletInitiativesListWithInstrumentSelector = createSelector(
  [idPayWalletInitiativesWithInstrumentSelector],
  initiatives => pot.map(initiatives, w => w.initiativeList)
);

export const idpayInitiativesListSelector = createSelector(
  [isIdPayEnabledSelector, idPayWalletInitiativesListWithInstrumentSelector],
  (isIdpayEnabled, initiatives) =>
    isIdpayEnabled ? pot.getOrElse(initiatives, []) : []
);

export const isIdpayWalletInitiativesWithInstrumentLoadingSelector = (
  state: GlobalState
) => pot.isLoading(state.features.idPay.wallet.initiativesWithInstrument);
export const isIdpayWalletInitiativesWithInstrumentErrorSelector = (
  state: GlobalState
) => pot.isError(state.features.idPay.wallet.initiativesWithInstrument);

export const singleInitiativeQueueValueSelector = (
  state: GlobalState,
  initiativeId: string
) =>
  state.features.idPay.wallet.initiativesWithInstrumentPairingQueue[
    initiativeId
  ];

  

export default reducer;
