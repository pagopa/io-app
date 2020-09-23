import { Action, combineReducers } from "redux";
import { RemoteValue } from "../../../model/RemoteValue";
import bpdEnabledReducer from "./enabled";

export type BdpDetailsState = {
  enabled: RemoteValue<boolean, Error>;
  // IBAN, value, points, other info...
};

const bpdDetailsReducer = combineReducers<BdpDetailsState, Action>({
  enabled: bpdEnabledReducer
});

export default bpdDetailsReducer;
