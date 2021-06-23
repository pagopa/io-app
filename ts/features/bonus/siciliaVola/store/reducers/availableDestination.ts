import * as pot from "italia-ts-commons/lib/pot";
import { AvailableDestination } from "../../types/SvVoucherRequest";
import { NetworkError } from "../../../../../utils/errors";
import { Action } from "../../../../../store/actions/types";
import { getType } from "typesafe-actions";
import {
  svGenerateVoucherAvailableDestination,
  svGenerateVoucherStart
} from "../actions/voucherGeneration";

export type AvailableDestinationState = pot.Pot<
  AvailableDestination,
  NetworkError
>;
const INITIAL_STATE: AvailableDestinationState = pot.none;

const reducer = (
  state: AvailableDestinationState = INITIAL_STATE,
  action: Action
): AvailableDestinationState => {
  switch (action.type) {
    case getType(svGenerateVoucherStart):
      return INITIAL_STATE;
    case getType(svGenerateVoucherAvailableDestination.request):
      return pot.toLoading(state);

    case getType(svGenerateVoucherAvailableDestination.success):
      return pot.some(action.payload);

    case getType(svGenerateVoucherAvailableDestination.failure):
      return pot.toError(state, action.payload);
  }
  return state;
};

export default reducer;
