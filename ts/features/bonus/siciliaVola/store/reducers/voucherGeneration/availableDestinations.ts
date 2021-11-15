import { getType } from "typesafe-actions";
import { createSelector } from "reselect";
import { AvailableDestinations } from "../../../types/SvVoucherRequest";
import { NetworkError } from "../../../../../../utils/errors";
import { Action } from "../../../../../../store/actions/types";
import {
  svGenerateVoucherAvailableDestination,
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

export type AvailableDestinationsState = RemoteValue<
  AvailableDestinations,
  NetworkError
>;
const INITIAL_STATE: AvailableDestinationsState = remoteUndefined;

const reducer = (
  state: AvailableDestinationsState = INITIAL_STATE,
  action: Action
): AvailableDestinationsState => {
  switch (action.type) {
    case getType(svGenerateVoucherStart):
      return INITIAL_STATE;
    case getType(svGenerateVoucherAvailableDestination.request):
      return remoteLoading;
    case getType(svGenerateVoucherAvailableDestination.success):
      return remoteReady(action.payload);
    case getType(svGenerateVoucherAvailableDestination.failure):
      return remoteError(action.payload);
  }
  return state;
};

export const availableDestinationsSelector = createSelector(
  [
    (state: GlobalState) =>
      state.bonus.sv.voucherGeneration.availableDestinations
  ],
  (
    availableDestinations: AvailableDestinationsState
  ): AvailableDestinationsState => availableDestinations
);

export default reducer;
