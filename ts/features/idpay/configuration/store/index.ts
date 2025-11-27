import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";

import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { InstrumentListDTO } from "../../../../../definitions/idpay/InstrumentListDTO";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import { NetworkError } from "../../../../utils/errors";
import { StatusEnum } from "../../../../../definitions/idpay/InstrumentDTO";
import {
  idpayInitiativeInstrumentDelete,
  idpayInitiativeInstrumentsGet
} from "./actions";

export type IdPayInitiativeConfigurationState = {
  instruments: pot.Pot<InstrumentListDTO, NetworkError>;
  instrumentStatus: Record<string, pot.Pot<StatusEnum, NetworkError>>;
};

const INITIAL_STATE: IdPayInitiativeConfigurationState = {
  instruments: pot.none,
  instrumentStatus: {}
};

const reducer = (
  state: IdPayInitiativeConfigurationState = INITIAL_STATE,
  action: Action
): IdPayInitiativeConfigurationState => {
  switch (action.type) {
    case getType(idpayInitiativeInstrumentsGet.request):
      if (!action.payload.isRefreshing) {
        return {
          ...state,
          instruments: pot.noneLoading
        };
      }
      return {
        ...state
      };
    case getType(idpayInitiativeInstrumentsGet.success):
      return {
        ...state,
        instruments: pot.some(action.payload)
      };
    case getType(idpayInitiativeInstrumentsGet.failure):
      return {
        ...state,
        instruments: pot.toError(state.instruments, action.payload)
      };
    case getType(idpayInitiativeInstrumentDelete.request): {
      const { instrumentId } = action.payload;
      if (!state.instrumentStatus[instrumentId]) {
        return {
          ...state,
          instrumentStatus: {
            ...state.instrumentStatus,
            [instrumentId]: pot.noneLoading
          }
        };
      }
      return {
        ...state,
        instrumentStatus: {
          ...state.instrumentStatus,
          [instrumentId]: pot.toLoading(state.instrumentStatus[instrumentId])
        }
      };
    }
    case getType(idpayInitiativeInstrumentDelete.success): {
      const { instrumentId } = action.payload;
      return {
        instruments: pipe(
          pot.getOrElse(state.instruments, null),
          O.fromNullable,
          O.map(el => el.instrumentList),
          O.map(instruments =>
            instruments.map(instrument => ({
              ...instrument,
              status:
                instrument.instrumentId === instrumentId
                  ? StatusEnum.PENDING_DEACTIVATION_REQUEST
                  : instrument.status
            }))
          ),
          O.map(instruments => pot.some({ instrumentList: instruments })),
          O.getOrElseW(() => pot.none)
        ),
        instrumentStatus: {
          ...state.instrumentStatus,
          [instrumentId]: pot.some(StatusEnum.PENDING_DEACTIVATION_REQUEST)
        }
      };
    }
    case getType(idpayInitiativeInstrumentDelete.failure): {
      const { instrumentId, error } = action.payload;
      return {
        ...state,
        instrumentStatus: {
          ...state.instrumentStatus,
          [instrumentId]: pot.toError(
            state.instrumentStatus[instrumentId],
            error
          )
        }
      };
    }
  }
  return state;
};

const idpayInitativeConfigurationSelector = (state: GlobalState) =>
  state.features.idPay.configuration;

const idpayInitiativePaymentMethodsSelector = createSelector(
  idpayInitativeConfigurationSelector,
  inititative => inititative.instruments
);

const idPayInitiativeInstrumentsStatusSelector = createSelector(
  idpayInitativeConfigurationSelector,
  inititative => inititative.instrumentStatus
);

/**
 * Selector that returns the list of retrieved instruments
 */
export const idpayDiscountInitiativeInstrumentsSelector = createSelector(
  idpayInitiativePaymentMethodsSelector,
  instruments =>
    pipe(
      pot.getOrElse(
        pot.map(instruments, instruments => instruments.instrumentList),
        []
      )
    )
);

/**
 * Selector that returns true if the instrument list is loading
 */
export const isLoadingDiscountInitiativeInstrumentsSelector = createSelector(
  idpayInitiativePaymentMethodsSelector,
  paymentMethods => pot.isLoading(paymentMethods)
);

/**
 * Selector used to know if a specific initiativeId is loading or not
 */
export const idPayIsLoadingInitiativeInstrumentSelector = createSelector(
  idPayInitiativeInstrumentsStatusSelector,
  (_: GlobalState, instrumentId: string) => instrumentId,
  (instrumentsStatus, instrumentId) =>
    instrumentsStatus[instrumentId] ?? pot.none
);

export default reducer;
