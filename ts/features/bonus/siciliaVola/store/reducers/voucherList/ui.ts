import { getType } from "typesafe-actions";
import { createSelector } from "reselect";
import { Action } from "../../../../../../store/actions/types";
import {
  svSetFilter,
  svVoucherListGet,
  svVoucherRevocation
} from "../../actions/voucherList";
import {
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined,
  RemoteValue
} from "../../../../bpd/model/RemoteValue";
import { svGenerateVoucherCompleted } from "../../actions/voucherGeneration";
import { NetworkError } from "../../../../../../utils/errors";
import { GlobalState } from "../../../../../../store/reducers/types";

export type VouchersListUiState = {
  nextPage?: number;
  requiredDataLoaded: RemoteValue<true, NetworkError>;
};

const INITIAL_STATE: VouchersListUiState = {
  nextPage: 1,
  requiredDataLoaded: remoteUndefined
};

const reducer = (
  state: VouchersListUiState = INITIAL_STATE,
  action: Action
): VouchersListUiState => {
  switch (action.type) {
    // when a voucher has been revoked the current voucher list is obsolete
    case getType(svGenerateVoucherCompleted):
    case getType(svSetFilter):
    case getType(svVoucherRevocation.success):
      return INITIAL_STATE;
    case getType(svVoucherListGet.request):
      return { ...state, requiredDataLoaded: remoteLoading };
    case getType(svVoucherListGet.success):
      return {
        nextPage:
          action.payload.length > 0 && state.nextPage !== undefined
            ? state.nextPage + 1
            : undefined,
        requiredDataLoaded: remoteReady(true)
      };
    case getType(svVoucherListGet.failure):
      return { ...state, requiredDataLoaded: remoteError(action.payload) };
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
