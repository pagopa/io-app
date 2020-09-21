import { Action, combineReducers } from "redux";
import { GlobalState } from "../../../../../../store/reducers/types";
import { getValue, RemoteValue } from "../../../model/RemoteValue";
import bpdActiveReducer from "./enabled";

export type BdpDetailsState = {
  active: RemoteValue<boolean, Error>;
  // IBAN, value, points, other info...
};

const bpdDetailsReducer = combineReducers<BdpDetailsState, Action>({
  active: bpdActiveReducer
});

export const bpdActiveSelector = (
  state: GlobalState
): RemoteValue<boolean, Error> => state.bonus.bpd.details.active;

export const bpdActiveValueSelector = (
  state: GlobalState
): boolean | undefined => getValue(state.bonus.bpd.details.active);

export default bpdDetailsReducer;
