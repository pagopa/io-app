import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as _ from "lodash";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import {
  InitiativeDTO,
  StatusEnum as InitiativeStatusEnum
} from "../../../../../definitions/idpay/InitiativeDTO";
import { InitiativeDetailDTO } from "../../../../../definitions/idpay/InitiativeDetailDTO";
import { OnboardingStatusDTO } from "../../../../../definitions/idpay/OnboardingStatusDTO";
import { TimelineDTO } from "../../../../../definitions/idpay/TimelineDTO";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import { NetworkError } from "../../../../utils/errors";
import {
  idPayBeneficiaryDetailsGet,
  idPayOnboardingStatusGet,
  idpayInitiativeGet,
  idpayTimelinePageGet
} from "./actions";

export type PaginatedTimelineDTO = Record<number, TimelineDTO>;

export type IdPayInitiativeState = {
  details: pot.Pot<InitiativeDTO, NetworkError>;
  beneficiaryDetails: pot.Pot<InitiativeDetailDTO, NetworkError>;
  onboardingStatus: pot.Pot<OnboardingStatusDTO, NetworkError>;
  timeline: pot.Pot<PaginatedTimelineDTO, NetworkError>;
};

const INITIAL_STATE: IdPayInitiativeState = {
  details: pot.none,
  beneficiaryDetails: pot.none,
  onboardingStatus: pot.none,
  timeline: pot.none
};

const reducer = (
  state: IdPayInitiativeState = INITIAL_STATE,
  action: Action
): IdPayInitiativeState => {
  switch (action.type) {
    case getType(idpayInitiativeGet.request):
      return {
        ...state,
        details: pot.toLoading(pot.none)
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
        timeline: pot.toUpdating(
          state.timeline,
          pot.getOrElse(state.timeline, {})
        )
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
    case getType(idPayBeneficiaryDetailsGet.request):
      return {
        ...state,
        beneficiaryDetails: pot.toLoading(pot.none)
      };
    case getType(idPayBeneficiaryDetailsGet.success):
      return {
        ...state,
        beneficiaryDetails: pot.some(action.payload)
      };
    case getType(idPayBeneficiaryDetailsGet.failure):
      return {
        ...state,
        beneficiaryDetails: pot.toError(
          state.beneficiaryDetails,
          action.payload
        )
      };
    case getType(idPayOnboardingStatusGet.request):
      return {
        ...state,
        onboardingStatus: pot.toLoading(pot.none)
      };
    case getType(idPayOnboardingStatusGet.success):
      return {
        ...state,
        onboardingStatus: pot.some(action.payload)
      };
    case getType(idPayOnboardingStatusGet.failure):
      return {
        ...state,
        onboardingStatus: pot.toError(state.onboardingStatus, action.payload)
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

export const idpayInitiativeIdSelector = createSelector(
  idpayInitiativeDetailsSelector,
  details =>
    pipe(
      details,
      pot.toOption,
      O.map(details => details.initiativeId),
      O.toUndefined
    )
);

export const idpayPaginatedTimelineSelector = createSelector(
  idpayInitativeSelector,
  initiative => initiative.timeline
);

export const idpayOperationListSelector = createSelector(
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

const idpayOperationListLengthSelector = createSelector(
  idpayOperationListSelector,
  operationList => operationList.length
);

export const initiativeNeedsConfigurationSelector = createSelector(
  idpayInitiativeDetailsSelector,
  idpayOperationListLengthSelector,
  (initiative, timelineLenght) =>
    pipe(
      initiative,
      pot.toOption,
      O.map(
        initiative =>
          initiative.status === InitiativeStatusEnum.NOT_REFUNDABLE &&
          timelineLenght <= 1
      ),
      O.getOrElse(() => false)
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

export const idPayBeneficiaryDetailsSelector = createSelector(
  idpayInitativeSelector,
  initiative => initiative.beneficiaryDetails
);

export default reducer;
