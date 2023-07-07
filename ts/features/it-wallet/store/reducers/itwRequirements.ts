import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import { itwRequirementsRequest } from "../actions";
import { ItWalletError } from "../../utils/errors/itwErrors";

export type ItwRequirementsState = pot.Pot<true, ItWalletError>;

const emptyState: ItwRequirementsState = pot.none;

const reducer = (
  state: ItwRequirementsState = emptyState,
  action: Action
): ItwRequirementsState => {
  switch (action.type) {
    case getType(itwRequirementsRequest.request):
      return pot.toLoading(state);
    case getType(itwRequirementsRequest.success):
      return pot.some(action.payload);
    case getType(itwRequirementsRequest.failure):
      return pot.toError(state, action.payload);
  }
  return state;
};

export const itwRequirementsSelector = (state: GlobalState) =>
  state.features.itWallet.itwRequirements;

export default reducer;
