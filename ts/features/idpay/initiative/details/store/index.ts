import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import _ from "lodash";
import { TimelineDTO } from "../../../../../../definitions/idpay/timeline/TimelineDTO";
import { InitiativeDTO } from "../../../../../../definitions/idpay/wallet/InitiativeDTO";
import { Action } from "../../../../../store/actions/types";
import { GlobalState } from "../../../../../store/reducers/types";
import {
  NetworkError,
  getErrorFromNetworkError
} from "../../../../../utils/errors";
import { idpayInitiativeGet, idpayTimelinePageGet } from "./actions";

type PaginatedTimelineDTO = {
  lastUpdate: Date;
  operationsRecord: Record<number, TimelineDTO["operationList"]>;
};

export type IDPayInitiativeState = {
  details: pot.Pot<InitiativeDTO, NetworkError>;
  timeline: pot.Pot<PaginatedTimelineDTO, NetworkError>;
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
      if (action.payload.page === 0) {
        return {
          ...state,
          timeline: pot.toLoading(pot.none)
        };
      }
      return {
        ...state,
        timeline: pot.toLoading(state.timeline)
      };
    case getType(idpayTimelinePageGet.success):
      const currentTimeline = pot.getOrElse(state.timeline, {
        lastUpdate: action.payload.timeline.lastUpdate,
        operationsRecord: []
      });
      const newOperationsRecord = {
        ...currentTimeline.operationsRecord,
        [action.payload.page]: action.payload.timeline.operationList
      };
      return {
        ...state,
        timeline: pot.some({
          lastUpdate: currentTimeline.lastUpdate,
          operationsRecord: newOperationsRecord
        })
      };
    case getType(idpayTimelinePageGet.failure):
      return {
        ...state,
        timeline: pot.toError(state.timeline, action.payload)
      };
  }
  return state;
};

export const idpayInitiativeDetailsSelector = (state: GlobalState) =>
  state.features.idPay.initiative.details;
export const idpayTimelineSelector = (state: GlobalState) =>
  state.features.idPay.initiative.timeline;
export const idpayIsLastTimelinePageSelector = (state: GlobalState) => {
  if (pot.isError(state.features.idPay.initiative.timeline)) {
    const err = getErrorFromNetworkError(
      state.features.idPay.initiative.timeline.error
    );
    return err.message === "404";
  }
  return false;
};
export const idpayMergedTimelineSelector = (state: GlobalState) =>
  pot.getOrElse(
    pot.map(state.features.idPay.initiative.timeline, timeline => ({
      lastUpdate: timeline.lastUpdate,
      operationsRecord: _.valuesIn(timeline.operationsRecord).flat()
    })),
    { operationsRecord: [], lastUpdate: new Date() }
  );
export const idpayTimelineLastPageSelector = (state: GlobalState) =>
  pot.getOrElse(
    pot.map(
      state.features.idPay.initiative.timeline,
      timeline => _.valuesIn(timeline.operationsRecord).length - 1
    ),
    -1
  );


export default reducer;
