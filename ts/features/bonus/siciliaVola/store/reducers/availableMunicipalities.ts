import { getType } from "typesafe-actions";
import { createSelector } from "reselect";
import {
  IndexedById,
  toArray,
  toIndexed
} from "../../../../../store/helpers/indexer";
import { Municipality } from "../../types/SvVoucherRequest";
import { NetworkError } from "../../../../../utils/errors";
import { Action } from "../../../../../store/actions/types";
import {
  svGenerateVoucherAvailableMunicipality,
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

export type AvailableMunicipalitiesState = RemoteValue<
  IndexedById<Municipality>,
  NetworkError
>;
const INITIAL_STATE: AvailableMunicipalitiesState = remoteUndefined;

const reducer = (
  state: AvailableMunicipalitiesState = INITIAL_STATE,
  action: Action
): AvailableMunicipalitiesState => {
  switch (action.type) {
    case getType(svGenerateVoucherStart):
    case getType(svGenerateVoucherAvailableState.request):
    case getType(svGenerateVoucherAvailableRegion.request):
    case getType(svGenerateVoucherAvailableProvince.request):
      return INITIAL_STATE;
    case getType(svGenerateVoucherAvailableMunicipality.request):
      return remoteLoading;
    case getType(svGenerateVoucherAvailableMunicipality.success):
      return remoteReady(toIndexed(action.payload, m => m.id));
    case getType(svGenerateVoucherAvailableMunicipality.failure):
      return remoteError(action.payload);
  }
  return state;
};

export default reducer;

export const availableMunicipalitiesSelector = createSelector(
  [
    (state: GlobalState) =>
      state.bonus.sv.voucherGeneration.availableMunicipalities
  ],
  (
    availableMunicipalities: AvailableMunicipalitiesState
  ): AvailableMunicipalitiesState => availableMunicipalities
);

export const availableMunicipalitiesItemsSelector = createSelector(
  [availableMunicipalitiesSelector],
  (availableMunicipalities: AvailableMunicipalitiesState): PickerItems => {
    switch (availableMunicipalities.kind) {
      case "ready":
        return toArray(availableMunicipalities.value).map(r => ({
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
