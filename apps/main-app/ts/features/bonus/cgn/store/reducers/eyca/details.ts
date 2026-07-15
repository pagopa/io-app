import { createSelector } from "reselect";
import { getType } from "typesafe-actions";

import { EycaCard } from "../../../../../../../definitions/cgn/EycaCard";
import {
  isReady,
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined,
  RemoteValue
} from "../../../../../../common/model/RemoteValue";
import { Action } from "../../../../../../store/actions/types";
import { GlobalState } from "../../../../../../store/reducers/types";
import { NetworkError } from "../../../../../../utils/errors";
import { cgnEycaStatus } from "../../actions/eyca/details";

export type EycaDetail =
  | {
      card: EycaCard;
      status: Extract<EycaDetailStatus, "FOUND">;
    }
  | {
      status: EycaDetailKOStatus;
    };
export type EycaDetailKOStatus = Exclude<EycaDetailStatus, "FOUND">;

export type EycaDetailsState = RemoteValue<EycaDetail, NetworkError>;
export type EycaDetailStatus = "ERROR" | "FOUND" | "INELIGIBLE" | "NOT_FOUND";

const INITIAL_STATE: EycaDetailsState = remoteUndefined;
const reducer = (
  state: EycaDetailsState = INITIAL_STATE,
  action: Action
): EycaDetailsState => {
  switch (action.type) {
    case getType(cgnEycaStatus.failure):
      return remoteError(action.payload);
    case getType(cgnEycaStatus.request):
      return remoteLoading;
    case getType(cgnEycaStatus.success):
      return remoteReady(action.payload);
  }
  return state;
};

export default reducer;

export const eycaDetailSelector = (state: GlobalState): EycaDetailsState =>
  state.bonus.cgn.eyca.details;

export const eycaCardSelector = createSelector(
  eycaDetailSelector,
  (eycaDetail: EycaDetailsState): EycaCard | undefined =>
    isReady(eycaDetail) && eycaDetail.value.status === "FOUND"
      ? eycaDetail.value.card
      : undefined
);
