import { getType } from "typesafe-actions";
import { createSelector } from "reselect";
import {
  IndexedById,
  toIndexed
} from "../../../../../../store/helpers/indexer";
import { Municipality } from "../../../types/SvVoucherRequest";
import { NetworkError } from "../../../../../../utils/errors";
import { Action } from "../../../../../../store/actions/types";
import {
  svGenerateVoucherAvailableMunicipality,
  svGenerateVoucherAvailableState,
  svGenerateVoucherResetAvailableMunicipality,
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
    case getType(svGenerateVoucherResetAvailableMunicipality):
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

export const availableMunicipalitiesSelector = createSelector(
  [
    (state: GlobalState) =>
      state.bonus.sv.voucherGeneration.availableMunicipalities
  ],
  (
    availableMunicipalities: AvailableMunicipalitiesState
  ): AvailableMunicipalitiesState => availableMunicipalities
);

export default reducer;
