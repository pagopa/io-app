import * as pot from "italia-ts-commons/lib/pot";
import { AvailableDestination } from "../../types/SvVoucherRequest";
import { NetworkError } from "../../../../../utils/errors";
import { Action } from "../../../../../store/actions/types";
import { getType } from "typesafe-actions";
import { svGenerateVoucherAvailableDestination } from "../actions/voucherGeneration";

const INITIAL_STATE: pot.Pot<AvailableDestination, NetworkError> = pot.none;

const reducer = (
  state: pot.Pot<AvailableDestination, NetworkError> = INITIAL_STATE,
  action: Action
): pot.Pot<AvailableDestination, NetworkError> => {
  switch (action.type) {
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
