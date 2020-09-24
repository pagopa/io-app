import { Action, combineReducers } from "redux";
import { RemoteValue } from "../../../model/RemoteValue";
import { CitizenResource } from "../../../../../../../definitions/bpd/citizen/CitizenResource";
import bdpCitizenReducer from "./citizen";

export type BdpDetailsState = {
  citizen: RemoteValue<CitizenResource, Error>;
  // IBAN, value, points, other info...
};

const bpdDetailsReducer = combineReducers<BdpDetailsState, Action>({
  citizen: bdpCitizenReducer
});

export default bpdDetailsReducer;
