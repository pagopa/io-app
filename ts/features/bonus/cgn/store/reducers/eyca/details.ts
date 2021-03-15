import { getType } from "typesafe-actions";
import { Action } from "../../../../../../store/actions/types";
import { GlobalState } from "../../../../../../store/reducers/types";
import { cgnEycaDetails } from "../../actions/eyca/details";
import {
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined,
  RemoteValue
} from "../../../../bpd/model/RemoteValue";
import { NetworkError } from "../../../../../../utils/errors";
import { EycaCard } from "../../../../../../../definitions/cgn/EycaCard";

export type EycadDetail = EycaCard | "NOT_FOUND";
export type EycaDetailsState = RemoteValue<EycadDetail, NetworkError>;

const INITIAL_STATE: EycaDetailsState = remoteUndefined;
const reducer = (
  state: EycaDetailsState = INITIAL_STATE,
  action: Action
): EycaDetailsState => {
  switch (action.type) {
    case getType(cgnEycaDetails.request):
      return remoteLoading;
    case getType(cgnEycaDetails.success):
      return remoteReady(action.payload);
    case getType(cgnEycaDetails.failure):
      return remoteError(action.payload);
  }
  return state;
};

export default reducer;

export const eycaDetailSelector = (state: GlobalState) =>
  state.bonus.cgn.eyca.details;
