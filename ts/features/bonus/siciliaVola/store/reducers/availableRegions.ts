import { getType } from "typesafe-actions";
import {
  IndexedById,
  toArray,
  toIndexed
} from "../../../../../store/helpers/indexer";
import { Region } from "../../types/SvVoucherRequest";
import { NetworkError } from "../../../../../utils/errors";
import { Action } from "../../../../../store/actions/types";
import {
  svGenerateVoucherAvailableRegion,
  svGenerateVoucherAvailableState,
  svGenerateVoucherStart
} from "../actions/voucherGeneration";
import {
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined,
  RemoteValue
} from "../../../bpd/model/RemoteValue";
import { createSelector } from "reselect";
import { GlobalState } from "../../../../../store/reducers/types";
import { PickerItems } from "../../../../../components/ui/ItemsPicker";

export type AvailableRegionsState = RemoteValue<
  IndexedById<Region>,
  NetworkError
>;
const INITIAL_STATE: AvailableRegionsState = remoteUndefined;

const reducer = (
  state: AvailableRegionsState = INITIAL_STATE,
  action: Action
): AvailableRegionsState => {
  switch (action.type) {
    case getType(svGenerateVoucherStart):
    case getType(svGenerateVoucherAvailableState.request):
      return INITIAL_STATE;
    case getType(svGenerateVoucherAvailableRegion.request):
      return remoteLoading;
    case getType(svGenerateVoucherAvailableRegion.success):
      return remoteReady(toIndexed(action.payload, r => r.id));
    case getType(svGenerateVoucherAvailableRegion.failure):
      return remoteError(action.payload);
  }
  return state;
};

export default reducer;

export const availableRegionsSelector = createSelector(
  [(state: GlobalState) => state.bonus.sv.voucherGeneration.availableRegions],
  (availableRegions: AvailableRegionsState): AvailableRegionsState =>
    availableRegions
);

export const availableRegionsItemsSelector = createSelector(
  [availableRegionsSelector],
  (availableRegions: AvailableRegionsState): PickerItems => {
    switch (availableRegions.kind) {
      case "ready":
        return toArray(availableRegions.value).map(r => ({
          value: r.id,
          label: r.name
        }));
      case "error":
      case "loading":
      case "undefined":
        return [];
    }
  }
);
