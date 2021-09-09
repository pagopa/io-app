import { getType } from "typesafe-actions";
import { Action } from "../../../../../../store/actions/types";
import {
  svResetFilter,
  svSetFilter,
  svUpdateNextPageNumber,
  svVoucherListGet
} from "../../actions/voucherList";
import {
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined,
  RemoteValue
} from "../../../../bpd/model/RemoteValue";
import { svGenerateVoucherStart } from "../../actions/voucherGeneration";
import { NetworkError } from "../../../../../../utils/errors";
import { createSelector } from "reselect";
import { GlobalState } from "../../../../../../store/reducers/types";

export type VouchersListUiState = {
  nextPage?: number;
  pagination: true;
  elementNumber: number;
  requiredDataLoaded: RemoteValue<true, NetworkError>;
};

const INITIAL_STATE: VouchersListUiState = {
  nextPage: 1,
  elementNumber: 10,
  pagination: true,
  requiredDataLoaded: remoteUndefined
};

const reducer = (
  state: VouchersListUiState = INITIAL_STATE,
  action: Action
): VouchersListUiState => {
  switch (action.type) {
    case getType(svGenerateVoucherStart):
    case getType(svSetFilter):
    case getType(svResetFilter):
      return INITIAL_STATE;
    case getType(svVoucherListGet.request):
      return { ...state, requiredDataLoaded: remoteLoading };
    case getType(svVoucherListGet.success):
      return { ...state, requiredDataLoaded: remoteReady(true) };
    case getType(svVoucherListGet.failure):
      return { ...state, requiredDataLoaded: remoteError(action.payload) };
    case getType(svUpdateNextPageNumber):
      return { ...state, nextPage: action.payload };
  }

  return state;
};

export const svVouchersListUiSelector = createSelector(
  [(state: GlobalState) => state.bonus.sv.voucherList.ui],
  (uiParameters: VouchersListUiState): VouchersListUiState => uiParameters
);

export const svRequiredDataLoadedSelector = createSelector(
  [(state: GlobalState) => state.bonus.sv.voucherList.ui.requiredDataLoaded],
  (
    requiredDataLoaded: RemoteValue<true, NetworkError>
  ): RemoteValue<true, NetworkError> => requiredDataLoaded
);

export default reducer;
