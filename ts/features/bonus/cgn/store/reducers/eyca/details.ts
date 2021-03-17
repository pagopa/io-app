import { getType } from "typesafe-actions";
import { Action } from "../../../../../../store/actions/types";
import { GlobalState } from "../../../../../../store/reducers/types";
import { cgnEycaStatus } from "../../actions/eyca/details";
import {
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
