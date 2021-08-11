import { getType } from "typesafe-actions";
import { createSelector } from "reselect";
import {
  IndexedById,
  toArray,
  toIndexed
} from "../../../../../store/helpers/indexer";
import { Province } from "../../types/SvVoucherRequest";
import { NetworkError } from "../../../../../utils/errors";
import { Action } from "../../../../../store/actions/types";
import {
  svGenerateVoucherAvailableProvince,
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
import { GlobalState } from "../../../../../store/reducers/types";
import { PickerItems } from "../../../../../components/ui/ItemsPicker";

export type AvailableProvincesState = RemoteValue<
  IndexedById<Province>,
  NetworkError
>;
const INITIAL_STATE: AvailableProvincesState = remoteUndefined;

const reducer = (
  state: AvailableProvincesState = INITIAL_STATE,
  action: Action
): AvailableProvincesState => {
  switch (action.type) {
    case getType(svGenerateVoucherStart):
    case getType(svGenerateVoucherAvailableState.request):
    case getType(svGenerateVoucherAvailableRegion.request):
      return INITIAL_STATE;
    case getType(svGenerateVoucherAvailableProvince.request):
      return remoteLoading;
    case getType(svGenerateVoucherAvailableProvince.success):
      return remoteReady(toIndexed(action.payload, p => p.id));
    case getType(svGenerateVoucherAvailableProvince.failure):
      return remoteError(action.payload);
  }
  return state;
};

export default reducer;

export const availableProvincesSelector = createSelector(
  [(state: GlobalState) => state.bonus.sv.voucherGeneration.availableProvinces],
  (availableProvinces: AvailableProvincesState): AvailableProvincesState =>
    availableProvinces
);

export const availableProvincesItemsSelector = createSelector(
  [availableProvincesSelector],
  (availableProvinces: AvailableProvincesState): PickerItems => {
    switch (availableProvinces.kind) {
      case "ready":
        return toArray(availableProvinces.value).map(p => ({
          value: p.id,
          label: p.name
        }));
      case "error":
      case "loading":
      case "undefined":
        return [];
    }
  }
);
