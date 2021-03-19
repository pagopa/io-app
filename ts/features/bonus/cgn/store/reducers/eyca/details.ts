import { getType } from "typesafe-actions";
import { createSelector } from "reselect";
import { Action } from "../../../../../../store/actions/types";
import { GlobalState } from "../../../../../../store/reducers/types";
import { cgnEycaStatus } from "../../actions/eyca/details";
import {
  isLoading,
  isReady,
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined,
  RemoteValue
} from "../../../../bpd/model/RemoteValue";
import { NetworkError } from "../../../../../../utils/errors";
import { EycaCard } from "../../../../../../../definitions/cgn/EycaCard";

export type EycaDetailStatus = "NOT_FOUND" | "INELIGIBLE" | "ERROR" | "FOUND";
export type EycaDetailKOStatus = Exclude<EycaDetailStatus, "FOUND">;

export type EycaDetail =
  | {
      status: Extract<EycaDetailStatus, "FOUND">;
      card: EycaCard;
    }
  | {
      status: EycaDetailKOStatus;
    };
export type EycaDetailsState = RemoteValue<EycaDetail, NetworkError>;

const INITIAL_STATE: EycaDetailsState = remoteUndefined;
const reducer = (
  state: EycaDetailsState = INITIAL_STATE,
  action: Action
): EycaDetailsState => {
  switch (action.type) {
    case getType(cgnEycaStatus.request):
      return remoteLoading;
    case getType(cgnEycaStatus.success):
      return remoteReady(action.payload);
    case getType(cgnEycaStatus.failure):
      return remoteError(action.payload);
  }
  return state;
};

export default reducer;

export const eycaDetailSelector = (state: GlobalState): EycaDetailsState =>
  state.bonus.cgn.eyca.details;

// Returns true if the EYCA state is in any status than INELIGIBLE
// NOT_FOUND or ERROR means the user may have an EYCA card but it's not available right now
// FOUND means the user have an EYCA card and card field is defined
export const isEycaEligible = createSelector(
  eycaDetailSelector,
  (eycaDetail: EycaDetailsState): boolean =>
    isReady(eycaDetail) && eycaDetail.value.status !== "INELIGIBLE"
);

export const eycaCardSelector = createSelector(
  eycaDetailSelector,
  (eycaDetail: EycaDetailsState): EycaCard | undefined =>
    isReady(eycaDetail) && eycaDetail.value.status === "FOUND"
      ? eycaDetail.value.card
      : undefined
);

export const isEycaDetailsLoading = createSelector(
  eycaDetailSelector,
  (eycaDetail: EycaDetailsState): boolean => isLoading(eycaDetail)
);
