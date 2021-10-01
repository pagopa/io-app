import { getType } from "typesafe-actions";
import { createSelector } from "reselect";
import { Action } from "../../../../../../store/actions/types";
import { svPossibleVoucherStateGet } from "../../actions/voucherList";
import {
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined,
  RemoteValue
} from "../../../../bpd/model/RemoteValue";
import { GlobalState } from "../../../../../../store/reducers/types";
import { StatoVoucherBeanList } from "../../../../../../../definitions/api_sicilia_vola/StatoVoucherBeanList";
import { NetworkError } from "../../../../../../utils/errors";

export type PossibleVoucherStateState = RemoteValue<
  StatoVoucherBeanList,
  NetworkError
>;

const INITIAL_STATE: PossibleVoucherStateState = remoteUndefined;

const reducer = (
  state: PossibleVoucherStateState = INITIAL_STATE,
  action: Action
): PossibleVoucherStateState => {
  switch (action.type) {
    case getType(svPossibleVoucherStateGet.request):
      return remoteLoading;
    case getType(svPossibleVoucherStateGet.success):
      return remoteReady(action.payload);
    case getType(svPossibleVoucherStateGet.failure):
      return remoteError(action.payload);
  }

  return state;
};

export const possibleVoucherStateSelector = createSelector(
  [(state: GlobalState) => state.bonus.sv.voucherList.possibleVoucherState],
  (
    possibleVoucherState: PossibleVoucherStateState
  ): PossibleVoucherStateState => possibleVoucherState
);

export default reducer;
