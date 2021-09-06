import { getType } from "typesafe-actions";
import { Action } from "../../../../../../store/actions/types";
import { svPossibleVoucherStateGet } from "../../actions/voucherList";
import {
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined,
  RemoteValue
} from "../../../../bpd/model/RemoteValue";
import { createSelector } from "reselect";
import { GlobalState } from "../../../../../../store/reducers/types";
import { StatoVoucherBeanList } from "../../../../../../../definitions/api_sicilia_vola/StatoVoucherBeanList";
import { NetworkError } from "../../../../../../utils/errors";

export type possibleVoucherStateState = RemoteValue<
  StatoVoucherBeanList,
  NetworkError
>;

const INITIAL_STATE: possibleVoucherStateState = remoteUndefined;

const reducer = (
  state: possibleVoucherStateState = INITIAL_STATE,
  action: Action
): possibleVoucherStateState => {
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
    possibleVoucherState: possibleVoucherStateState
  ): possibleVoucherStateState => possibleVoucherState
);

export default reducer;
