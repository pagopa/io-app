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
  idPayWalletGet,
  idpayInitiativesInstrumentDelete,
  idpayInitiativesInstrumentEnroll
} from "../actions";

export type IdPayWalletState = {
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

const INITIAL_STATE: IdPayWalletState = {
  initiatives: pot.none,
  initiativesWithInstrument: pot.none,
  initiativesAwaitingStatusUpdate: {}
};

const reducer = (
  state: IdPayWalletState = INITIAL_STATE,
  action: Action
): IdPayWalletState => {
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
      if (!action.payload.isRefreshing) {
        return {
          ...state,
          initiativesWithInstrument: pot.noneLoading,
          initiativesAwaitingStatusUpdate: {}
        };
      }

      if (pot.isSome(state.initiativesWithInstrument)) {
        return {
          ...state,
          initiativesWithInstrument: pot.toUpdating(
            state.initiativesWithInstrument,
            state.initiativesWithInstrument.value
          )
        };
      }

      if (!pot.isError(state.initiativesWithInstrument)) {
        return {
          ...state,
          initiativesWithInstrument: pot.toLoading(
            state.initiativesWithInstrument
          )
        };
      }
      return {
        ...state,
        initiativesWithInstrument: state.initiativesWithInstrument
      };
    case getType(idPayInitiativesFromInstrumentGet.success):
      const initiativesToKeepInLoadingState = pipe(
        state.initiativesAwaitingStatusUpdate,
        Object.entries,
        // remove all entries that have completed their request
        entries => entries.filter(([_, value]) => value),
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

const selectIdPayWallet = (state: GlobalState) => state.features.idPay.wallet;

export const idPayWalletInitiativeListSelector = createSelector(
  selectIdPayWallet,
  ({ initiatives }) =>
    pot.map(initiatives, ({ initiativeList }) => initiativeList)
);

export const idPayWalletSubscribedInitiativeListSelector = createSelector(
  idPayWalletInitiativeListSelector,
  initiativeListPot =>
    pot.map(initiativeListPot, list =>
      list.filter(({ status }) => status !== InitiativeStatus.UNSUBSCRIBED)
    )
);

export const idPayInitiativesFromInstrumentSelector = createSelector(
  selectIdPayWallet,
  ({ initiativesWithInstrument }) => initiativesWithInstrument
);

export const idPayWalletInitiativesListWithInstrumentSelector = createSelector(
  [idPayInitiativesFromInstrumentSelector],
  initiatives => pot.map(initiatives, ({ initiativeList }) => initiativeList)
);

export const idPayEnabledInitiativesFromInstrumentSelector = createSelector(
  [isIdPayEnabledSelector, idPayWalletInitiativesListWithInstrumentSelector],
  (isIdpayEnabled, initiatives) =>
    isIdpayEnabled ? pot.getOrElse(initiatives, []) : []
);

export const idPayAreInitiativesFromInstrumentLoadingSelector = createSelector(
  [isIdPayEnabledSelector, idPayInitiativesFromInstrumentSelector],
  (isIDPayEnabled, initiativesPot) =>
    isIDPayEnabled && pot.isLoading(initiativesPot)
);

export const idPayAreInitiativesFromInstrumentErrorSelector = createSelector(
  selectIdPayWallet,
  wallet => pot.isError(wallet.initiativesWithInstrument)
);

export const idPayInitiativesAwaitingUpdateSelector = createSelector(
  selectIdPayWallet,
  wallet => wallet.initiativesAwaitingStatusUpdate
);

export const idPayInitiativeFromInstrumentPotSelector = (
  initiativeId: string
) =>
  createSelector(
    [
      idPayEnabledInitiativesFromInstrumentSelector,
      idPayInitiativesAwaitingUpdateSelector
    ],
    (initiativesByInstrument, initiativesAwaitingUpdate) => {
      const initiative = initiativesByInstrument.find(
        i => i.initiativeId === initiativeId
      );
      const isItemActive =
        initiative?.status === InstrumentInitiativeStatus.ACTIVE;
      const isAwaitingUpdate = initiativesAwaitingUpdate[initiativeId];

      switch (isAwaitingUpdate) {
        case undefined:
          return pot.some(isItemActive);
        case true:
          return pot.someLoading(isItemActive);
        case false:
          return pot.someLoading(isItemActive);
        default:
          return pot.none;
      }
    }
  );

export default reducer;
