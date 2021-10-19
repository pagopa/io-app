import * as pot from "italia-ts-commons/lib/pot";
import { getType } from "typesafe-actions";
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
  svGenerateVoucherStart
} from "../../actions/voucherGeneration";
import { createSelector } from "reselect";
import { GlobalState } from "../../../../../../store/reducers/types";

export type AvailableMunicipalitiesState = pot.Pot<
  IndexedById<Municipality>,
  NetworkError
>;
const INITIAL_STATE: AvailableMunicipalitiesState = pot.none;

const reducer = (
  state: AvailableMunicipalitiesState = INITIAL_STATE,
  action: Action
): AvailableMunicipalitiesState => {
  switch (action.type) {
    case getType(svGenerateVoucherStart):
      return INITIAL_STATE;
    case getType(svGenerateVoucherAvailableState.request):
      return pot.none;
    case getType(svGenerateVoucherAvailableMunicipality.request):
      return pot.toLoading(state);
    case getType(svGenerateVoucherAvailableMunicipality.success):
      return pot.some(toIndexed(action.payload, m => m.id));
    case getType(svGenerateVoucherAvailableMunicipality.failure):
      return pot.toError(state, action.payload);
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
