import { getType } from "typesafe-actions";
import { createSelector } from "reselect";
import {
  IndexedById,
  toIndexed
} from "../../../../../../store/helpers/indexer";
import { State } from "../../../types/SvVoucherRequest";
import { NetworkError } from "../../../../../../utils/errors";
import { Action } from "../../../../../../store/actions/types";
import {
  svGenerateVoucherAvailableState,
  svGenerateVoucherStart
} from "../../actions/voucherGeneration";
import { GlobalState } from "../../../../../../store/reducers/types";
import {
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined,
  RemoteValue
} from "../../../../bpd/model/RemoteValue";

export type AvailableStatesState = RemoteValue<
  IndexedById<State>,
  NetworkError
>;
const INITIAL_STATE: AvailableStatesState = remoteUndefined;

const reducer = (
  state: AvailableStatesState = INITIAL_STATE,
  action: Action
): AvailableStatesState => {
  switch (action.type) {
    case getType(svGenerateVoucherStart):
      return INITIAL_STATE;
    case getType(svGenerateVoucherAvailableState.request):
      return remoteLoading;
    case getType(svGenerateVoucherAvailableState.success):
      return remoteReady(toIndexed(action.payload, s => s.id));
    case getType(svGenerateVoucherAvailableState.failure):
      return remoteError(action.payload);
  }
  return state;
};

export const availableStatesSelector = createSelector(
  [(state: GlobalState) => state.bonus.sv.voucherGeneration.availableStates],
  (availableState: AvailableStatesState): AvailableStatesState => availableState
);

export default reducer;
