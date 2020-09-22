import { Action, combineReducers } from "redux";
import { RemoteValue } from "../../../model/RemoteValue";
import { CitizenResource } from "../../../../../../../definitions/bdp/citizen/CitizenResource";
import bpdEnabledReducer from "./enabled";

export type BdpDetailsState = {
  citizen: RemoteValue<CitizenResource, Error>;
  // IBAN, value, points, other info...
};

const bpdDetailsReducer = combineReducers<BdpDetailsState, Action>({
  citizen: bpdEnabledReducer
});

export default bpdDetailsReducer;
