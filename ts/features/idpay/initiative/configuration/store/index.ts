import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import * as _ from "lodash";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { InstrumentListDTO } from "../../../../../../definitions/idpay/InstrumentListDTO";
import { Action } from "../../../../../store/actions/types";
import { GlobalState } from "../../../../../store/reducers/types";
import { NetworkError } from "../../../../../utils/errors";
import { idpayInitiativePaymentMethodsGet } from "./actions";

export type IDPayInitiativeConfigurationState = {
  paymentMethods: pot.Pot<InstrumentListDTO, NetworkError>;
};

const INITIAL_STATE: IDPayInitiativeConfigurationState = {
  paymentMethods: pot.none
};

const reducer = (
  state: IDPayInitiativeConfigurationState = INITIAL_STATE,
  action: Action
): IDPayInitiativeConfigurationState => {
  switch (action.type) {
    case getType(idpayInitiativePaymentMethodsGet.request):
      return {
        ...state,
        paymentMethods: pot.toLoading(pot.none)
      };
    case getType(idpayInitiativePaymentMethodsGet.success):
      return {
        ...state,
        paymentMethods: pot.some(action.payload)
      };
    case getType(idpayInitiativePaymentMethodsGet.failure):
      return {
        ...state,
        paymentMethods: pot.toError(state.paymentMethods, action.payload)
      };
  }
  return state;
};

const idpayInitativeConfigurationSelector = (state: GlobalState) =>
  state.features.idPay.configuration;

export const idpayInitiativePaymentMethodsSelector = createSelector(
  idpayInitativeConfigurationSelector,
  inititative => inititative.paymentMethods
);

export const idpayInitiativePaymentMethodsInstrumentsSelector = createSelector(
  idpayInitiativePaymentMethodsSelector,
  paymentMethods =>
    pipe(
      pot.getOrElse(
        pot.map(
          paymentMethods,
          paymentMethods => paymentMethods.instrumentList
        ),
        []
      )
    )
);

export const isLoadingPaymentMethodsSelector = createSelector(
  idpayInitiativePaymentMethodsSelector,
  paymentMethods => pot.isLoading(paymentMethods)
);

export default reducer;
