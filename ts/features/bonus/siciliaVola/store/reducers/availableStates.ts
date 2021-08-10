import { getType } from "typesafe-actions";
import {
  IndexedById,
  toArray,
  toIndexed
} from "../../../../../store/helpers/indexer";
import { State } from "../../types/SvVoucherRequest";
import { NetworkError } from "../../../../../utils/errors";
import { Action } from "../../../../../store/actions/types";
import {
  svGenerateVoucherAvailableState,
  svGenerateVoucherStart
} from "../actions/voucherGeneration";
import { createSelector } from "reselect";
import { GlobalState } from "../../../../../store/reducers/types";
import {
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined,
  RemoteValue
} from "../../../bpd/model/RemoteValue";
import { PickerItems } from "../../../../../components/ui/ItemsPicker";

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

export default reducer;

export const availableStatesSelector = createSelector(
  [(state: GlobalState) => state.bonus.sv.voucherGeneration.availableStates],
  (availableState: AvailableStatesState): AvailableStatesState => availableState
);

export const availableStateItemsSelector = createSelector(
  [availableStatesSelector],
  (availableState: AvailableStatesState): PickerItems => {
    switch (availableState.kind) {
      case "ready":
        return toArray(availableState.value).map(s => ({
          value: s.id,
          label: s.name
        }));
      case "error":
      case "loading":
      case "undefined":
        return [];
    }
  }
);
