import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import * as _ from "lodash";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { InstrumentListDTO } from "../../../../../../definitions/idpay/InstrumentListDTO";
import { Action } from "../../../../../store/actions/types";
import { GlobalState } from "../../../../../store/reducers/types";
import { NetworkError } from "../../../../../utils/errors";
import { idpayDiscountInitiativeInstrumentsGet } from "./actions";

export type IDPayInitiativeConfigurationState = {
  discountInstruments: pot.Pot<InstrumentListDTO, NetworkError>;
};

const INITIAL_STATE: IDPayInitiativeConfigurationState = {
  discountInstruments: pot.none
};

const reducer = (
  state: IDPayInitiativeConfigurationState = INITIAL_STATE,
  action: Action
): IDPayInitiativeConfigurationState => {
  switch (action.type) {
    case getType(idpayDiscountInitiativeInstrumentsGet.request):
      return {
        ...state,
        discountInstruments: pot.toLoading(pot.none)
      };
    case getType(idpayDiscountInitiativeInstrumentsGet.success):
      return {
        ...state,
        discountInstruments: pot.some(action.payload)
      };
    case getType(idpayDiscountInitiativeInstrumentsGet.failure):
      return {
        ...state,
        discountInstruments: pot.toError(
          state.discountInstruments,
          action.payload
        )
      };
  }
  return state;
};

const idpayInitativeConfigurationSelector = (state: GlobalState) =>
  state.features.idPay.configuration;

export const idpayInitiativePaymentMethodsSelector = createSelector(
  idpayInitativeConfigurationSelector,
  inititative => inititative.discountInstruments
);

export const idpayDiscountInitiativeInstrumentsSelector = createSelector(
  idpayInitiativePaymentMethodsSelector,
  discountInstruments =>
    pipe(
      pot.getOrElse(
        pot.map(
          discountInstruments,
          discountInstruments => discountInstruments.instrumentList
        ),
        []
      )
    )
);

export const isLoadingDiscountInitiativeInstrumentsSelector = createSelector(
  idpayInitiativePaymentMethodsSelector,
  paymentMethods => pot.isLoading(paymentMethods)
);

export default reducer;
