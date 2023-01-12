import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { TimelineDTO } from "../../../../../../definitions/idpay/timeline/TimelineDTO";
import { InitiativeDTO } from "../../../../../../definitions/idpay/wallet/InitiativeDTO";
import { Action } from "../../../../../store/actions/types";
import { GlobalState } from "../../../../../store/reducers/types";
import { NetworkError } from "../../../../../utils/errors";
import {
  idpayInitiativeGet,
  idpayTimelineGet,
  idpayTimelinePaginationGet
} from "./actions";

export type IDPayInitiativeState = {
  details: pot.Pot<InitiativeDTO, NetworkError>;
  timeline: pot.Pot<TimelineDTO, NetworkError>;
  timelinePage: pot.Pot<number, NetworkError>;
};

const INITIAL_STATE: IDPayInitiativeState = {
  details: pot.none,
  timeline: pot.none,
  timelinePage: pot.some(1)
};

const reducer = (
  state: IDPayInitiativeState = INITIAL_STATE,
  action: Action
): IDPayInitiativeState => {
  switch (action.type) {
    case getType(idpayInitiativeGet.request):
      return {
        ...state,
        details: pot.toLoading(state.details)
      };
    case getType(idpayInitiativeGet.success):
      return {
        ...state,
        details: pot.some(action.payload)
      };
    case getType(idpayInitiativeGet.failure):
      return {
        ...state,
        details: pot.toError(state.details, action.payload)
      };
    // TIMELINE ACTIONS
    case getType(idpayTimelineGet.request):
      return {
        ...state,
        timeline: pot.toLoading(state.timeline),
        timelinePage: pot.some(1)
      };
    case getType(idpayTimelineGet.success):
      return {
        ...state,
        timeline: pot.some(action.payload)
      };
    case getType(idpayTimelineGet.failure):
      return {
        ...state,
        timeline: pot.toError(state.timeline, action.payload)
      };
    // TIMELINE PAGINATION ACTIONS
    case getType(idpayTimelinePaginationGet.request):
      return {
        ...state,
        timelinePage: pot.toLoading(state.timelinePage)
      };
    case getType(idpayTimelinePaginationGet.success):
      const currentPage = pot.getOrElse(state.timelinePage, 0);
      return {
        ...state,
        timeline: pot.some(action.payload),
        timelinePage: pot.some(currentPage + 1)
      };
    case getType(idpayTimelinePaginationGet.failure):
      return {
        ...state,
        timelinePage: pot.toError(state.timelinePage, action.payload)
      };
  }
  return state;
};

export const idpayInitiativeDetailsSelector = (state: GlobalState) =>
  state.features.idPay.initiative.details;
export const idpayTimelineSelector = (state: GlobalState) =>
  state.features.idPay.initiative.timeline;
export const idpayTimelinePageSelector = (state: GlobalState) =>
  state.features.idPay.initiative.timelinePage;

export default reducer;
