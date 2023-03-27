import * as pot from "@pagopa/ts-commons/lib/pot";
import * as _ from "lodash";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { OperationDTO } from "../../../../../../definitions/idpay/OperationDTO";
import { TimelineDTO } from "../../../../../../definitions/idpay/TimelineDTO";
import { InitiativeDTO } from "../../../../../../definitions/idpay/InitiativeDTO";
import { Action } from "../../../../../store/actions/types";
import { GlobalState } from "../../../../../store/reducers/types";
import { NetworkError } from "../../../../../utils/errors";
import {
  idpayInitiativeGet,
  idpayTimelineDetailsGet,
  idpayTimelinePageGet
} from "./actions";

type PaginatedTimelineDTO = Record<number, TimelineDTO>;

export type IDPayInitiativeState = {
  details: pot.Pot<InitiativeDTO, NetworkError>;
  timeline: pot.Pot<PaginatedTimelineDTO, NetworkError>;
  timelineDetails: pot.Pot<OperationDTO, NetworkError>;
};

const INITIAL_STATE: IDPayInitiativeState = {
  details: pot.none,
  timeline: pot.none,
  timelineDetails: pot.none
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
      const currentTimeline = pot.getOrElse(state.timeline, []);

      return {
        ...state,
        timeline: pot.some({
          ...currentTimeline,
          [action.payload.page]: action.payload.timeline
        })
      };
    case getType(idpayTimelinePageGet.failure):
      return {
        ...state,
        timeline: pot.toError(state.timeline, action.payload)
      };
    case getType(idpayTimelineDetailsGet.request):
      return {
        ...state,
        timelineDetails: pot.toLoading(pot.none)
      };
    case getType(idpayTimelineDetailsGet.success):
      return {
        ...state,
        timelineDetails: pot.some(action.payload)
      };
    case getType(idpayTimelineDetailsGet.failure):
      return {
        ...state,
        timelineDetails: pot.toError(state.timelineDetails, action.payload)
      };
  }
  return state;
};

const idpayInitativeSelector = (state: GlobalState) =>
  state.features.idPay.initiative;

export const idpayInitiativeDetailsSelector = createSelector(
  idpayInitativeSelector,
  initiative => initiative.details
);

export const idpayPaginatedTimelineSelector = createSelector(
  idpayInitativeSelector,
  initiative => initiative.timeline
);

export const idpayTimelineSelector = createSelector(
  idpayPaginatedTimelineSelector,
  paginatedTimelinePot =>
    pot.getOrElse(
      pot.map(paginatedTimelinePot, (paginatedTimeline: PaginatedTimelineDTO) =>
        _.flatMap(
          Object.values(paginatedTimeline),
          timeline => timeline.operationList
        )
      ),
      []
    )
);

export const idpayTimelineCurrentPageSelector = createSelector(
  idpayPaginatedTimelineSelector,
  paginatedTimelinePot =>
    pot.getOrElse(
      pot.map(
        paginatedTimelinePot,
        (timeline: PaginatedTimelineDTO) => Object.keys(timeline).length - 1
      ),
      -1
    )
);

export const idpayTimelineLastUpdateSelector = createSelector(
  idpayPaginatedTimelineSelector,
  paginatedTimelinePot =>
    pot.getOrElse(
      pot.map(
        paginatedTimelinePot,
        // lastUpdate is the same for all the pages
        (paginatedTimeline: PaginatedTimelineDTO) =>
          paginatedTimeline[0].lastUpdate
      ),
      undefined
    )
);

export const idpayTimelineIsLastPageSelector = createSelector(
  idpayPaginatedTimelineSelector,
  idpayTimelineCurrentPageSelector,
  (paginatedTimeline, currentPage) =>
    pot.getOrElse(
      pot.map(paginatedTimeline, paginatedTimeline => {
        const { totalPages } = paginatedTimeline[currentPage];
        return currentPage >= totalPages - 1;
      }),
      false
    )
);

export const idpayTimelineDetailsSelector = createSelector(
  idpayInitativeSelector,
  initiative => initiative.timelineDetails
);

export default reducer;
