import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { StatusEnum as InitiativeStatus } from "../../../../../../definitions/idpay/InitiativeDTO";
import { StatusEnum as InstrumentInitiativeStatus } from "../../../../../../definitions/idpay/InitiativesStatusDTO";
import { InitiativesWithInstrumentDTO } from "../../../../../../definitions/idpay/InitiativesWithInstrumentDTO";
import { WalletDTO } from "../../../../../../definitions/idpay/WalletDTO";
import { Action } from "../../../../../store/actions/types";
import { isIdPayEnabledSelector } from "../../../../../store/reducers/backendStatus";
import { GlobalState } from "../../../../../store/reducers/types";
import { NetworkError } from "../../../../../utils/errors";
import {
  idPayInitiativesFromInstrumentGet,
  idpayInitiativesInstrumentDelete,
  idpayInitiativesInstrumentEnroll,
  idPayWalletGet
} from "../actions";

export type IDPayWalletState = {
  initiatives: pot.Pot<WalletDTO, NetworkError>;
  initiativesWithInstrument: pot.Pot<
    InitiativesWithInstrumentDTO,
    NetworkError
  >;
  initiativesAwaitingStatusUpdate: Record<string, boolean>;
  // structure: {initiativeId: is waiting for response to pair/unpair api call}
  // this will be populated on selection and reset when not loading and
  // we have a response from BE
};

const INITIAL_STATE: IDPayWalletState = {
  initiatives: pot.none,
  initiativesWithInstrument: pot.none,
  initiativesAwaitingStatusUpdate: {}
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
    case getType(idPayInitiativesFromInstrumentGet.request):
      if (!action.payload.isRefreshCall) {
        return {
          ...state,
          initiativesWithInstrument: pot.noneLoading,
          initiativesAwaitingStatusUpdate: {}
        };
      }
      break;
    case getType(idPayInitiativesFromInstrumentGet.success):
      const initiativesToKeepInLoadingState = pipe(
        state.initiativesAwaitingStatusUpdate,
        Object.entries,
        entries => entries.filter(([_, value]) => value), // remove all entries that have completed their request
        Object.fromEntries
      );

      return {
        ...state,
        initiativesWithInstrument: pot.some(action.payload),
        initiativesAwaitingStatusUpdate: initiativesToKeepInLoadingState
      };
    case getType(idPayInitiativesFromInstrumentGet.failure):
      return {
        ...state,
        initiativesWithInstrument: pot.toError(
          state.initiativesWithInstrument,
          action.payload
        )
      };
    // initiative pairing
    case getType(idpayInitiativesInstrumentDelete.request):
    case getType(idpayInitiativesInstrumentEnroll.request):
      return {
        ...state,
        initiativesAwaitingStatusUpdate: {
          ...state.initiativesAwaitingStatusUpdate,
          [action.payload.initiativeId]: true
        }
      };
    case getType(idpayInitiativesInstrumentDelete.success):
    case getType(idpayInitiativesInstrumentEnroll.success):
    case getType(idpayInitiativesInstrumentDelete.failure):
    case getType(idpayInitiativesInstrumentEnroll.failure):
      return {
        ...state,
        initiativesAwaitingStatusUpdate: {
          ...state.initiativesAwaitingStatusUpdate,
          [action.payload.initiativeId]: false
        }
      };
  }
  return state;
};

export const idPayWalletSelector = (state: GlobalState) =>
  state.features.idPay.wallet.initiatives;

export const idPayWalletInitiativeListSelector = createSelector(
  idPayWalletSelector,
  walletPot => pot.map(walletPot, wallet => wallet.initiativeList)
);

export const idPayWalletSubscribedInitiativeListSelector = createSelector(
  idPayWalletInitiativeListSelector,
  initiativeListPot =>
    pot.map(initiativeListPot, initiativeList =>
      initiativeList.filter(
        initiative => initiative.status !== InitiativeStatus.UNSUBSCRIBED
      )
    )
);

export const idPayInitiativesFromInstrumentSelector = (state: GlobalState) =>
  pot.map(state.features.idPay.wallet.initiativesWithInstrument, w => w);
export const idPayWalletInitiativesListWithInstrumentSelector = createSelector(
  [idPayInitiativesFromInstrumentSelector],
  initiatives => pot.map(initiatives, w => w.initiativeList)
);

export const idPayEnabledInitiativesFromInstrumentSelector = createSelector(
  [isIdPayEnabledSelector, idPayWalletInitiativesListWithInstrumentSelector],
  (isIdpayEnabled, initiatives) =>
    isIdpayEnabled ? pot.getOrElse(initiatives, []) : []
);

const idPayInitiativesFromInstrumentPotSelector = (state: GlobalState) =>
  state.features.idPay.wallet.initiativesWithInstrument;

export const idPayAreInitiativesFromInstrumentLoadingSelector = createSelector(
  [isIdPayEnabledSelector, idPayInitiativesFromInstrumentPotSelector],
  (isIDPayEnabled, initiativesPot) =>
    isIDPayEnabled && pot.isLoading(initiativesPot)
);
export const idPayAreInitiativesFromInstrumentErrorSelector = (
  state: GlobalState
) => pot.isError(state.features.idPay.wallet.initiativesWithInstrument);

export const idPayInitiativeAwaitingUpdateSelector = (
  state: GlobalState,
  initiativeId: string
) => state.features.idPay.wallet.initiativesAwaitingStatusUpdate[initiativeId];

export const idPayInitiativeFromInstrumentPotSelector = (
  state: GlobalState,
  initiativeId: string
) => {
  const initiative = idPayEnabledInitiativesFromInstrumentSelector(state).find(
    i => i.initiativeId === initiativeId
  );
  const isItemActive = initiative?.status === InstrumentInitiativeStatus.ACTIVE;
  const isAwaitingUpdate = idPayInitiativeAwaitingUpdateSelector(
    state,
    initiativeId
  );
  const isItemActivePot = pot.some(isItemActive);
  switch (isAwaitingUpdate) {
    case undefined:
      return isItemActivePot;
    case true:
      return pot.someLoading(isItemActive);
    case false:
      return pot.someUpdating(isItemActive, !isItemActive);
    default:
      return pot.none;
  }
};

export default reducer;
