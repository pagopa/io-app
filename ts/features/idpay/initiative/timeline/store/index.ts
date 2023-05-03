import * as pot from "@pagopa/ts-commons/lib/pot";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { OperationDTO } from "../../../../../../definitions/idpay/OperationDTO";
import { Action } from "../../../../../store/actions/types";
import { GlobalState } from "../../../../../store/reducers/types";
import { NetworkError } from "../../../../../utils/errors";
import { idpayTimelineDetailsGet } from "./actions";

export type IDPayTimelineState = {
  details: pot.Pot<OperationDTO, NetworkError>;
};

const INITIAL_STATE: IDPayTimelineState = {
  details: pot.none
};

const reducer = (
  state: IDPayTimelineState = INITIAL_STATE,
  action: Action
): IDPayTimelineState => {
  switch (action.type) {
    case getType(idpayTimelineDetailsGet.request):
      return {
        ...state,
        details: pot.noneLoading
      };
    case getType(idpayTimelineDetailsGet.success):
      return {
        ...state,
        details: pot.some(action.payload)
      };
    case getType(idpayTimelineDetailsGet.failure):
      return {
        ...state,
        details: pot.toError(state.details, action.payload)
      };
  }
  return state;
};

const idpayTimelineSelector = (state: GlobalState) =>
  state.features.idPay.timeline;

export const idpayTimelineDetailsSelector = createSelector(
  idpayTimelineSelector,
  timeline => timeline.details
);

export default reducer;
