import * as pot from "italia-ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { AvailableDestinations } from "../../types/SvVoucherRequest";
import { NetworkError } from "../../../../../utils/errors";
import { Action } from "../../../../../store/actions/types";
import {
  svGenerateVoucherAvailableDestination,
  svGenerateVoucherStart
} from "../actions/voucherGeneration";

export type AvailableDestinationsState = pot.Pot<
  AvailableDestinations,
  NetworkError
>;
const INITIAL_STATE: AvailableDestinationsState = pot.none;

const reducer = (
  state: AvailableDestinationsState = INITIAL_STATE,
  action: Action
): AvailableDestinationsState => {
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
