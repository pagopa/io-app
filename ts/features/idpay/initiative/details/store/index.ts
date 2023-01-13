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
  idpayTimelinePageGet
} from "./actions";

export type IDPayInitiativeState = {
  details: pot.Pot<InitiativeDTO, NetworkError>;
  timeline: pot.Pot<TimelineDTO, NetworkError>;
};

const INITIAL_STATE: IDPayInitiativeState = {
  details: pot.none,
  timeline: pot.none
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
    case getType(idpayTimelinePageGet.request):
    case getType(idpayTimelineGet.request):
      return {
        ...state,
        timeline: pot.toLoading(state.timeline)
      };
    case getType(idpayTimelineGet.success):
      return {
        ...state,
        timeline: pot.some(action.payload)
      };
    case getType(idpayTimelinePageGet.failure):
    case getType(idpayTimelineGet.failure):
      return {
        ...state,
        timeline: pot.toError(state.timeline, action.payload)
      };
    case getType(idpayTimelinePageGet.success):
      const currentTimeline = pot.getOrElse(state.timeline, {
        lastUpdate: action.payload.lastUpdate,
        operationList: []
      });
      return {
        ...state,
        timeline: pot.some({
          lastUpdate: currentTimeline.lastUpdate,
          operationList: [
            ...currentTimeline.operationList,
            ...action.payload.operationList
          ]
        })
      };
  }
  return state;
};

export const idpayInitiativeDetailsSelector = (state: GlobalState) =>
  state.features.idPay.initiative.details;
export const idpayTimelineSelector = (state: GlobalState) =>
  state.features.idPay.initiative.timeline;

export default reducer;
