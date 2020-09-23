import { Action, combineReducers } from "redux";
import { GlobalState } from "../../../../../../store/reducers/types";
import { getValue, RemoteValue } from "../../../model/RemoteValue";
import { CitizenResource } from "../../../../../../../definitions/bpd/citizen/CitizenResource";
import bdpCitizenReducer from "./citizen";

export type BdpDetailsState = {
  citizen: RemoteValue<CitizenResource, Error>;
  // IBAN, value, points, other info...
};

const bpdDetailsReducer = combineReducers<BdpDetailsState, Action>({
  citizen: bdpCitizenReducer
});

export const bpdActiveSelector = (
  state: GlobalState
): RemoteValue<CitizenResource, Error> => state.bonus.bpd.details.citizen;

export const bpdActiveValueSelector = (
  state: GlobalState
): boolean | undefined => getValue(state.bonus.bpd.details.citizen)?.enabled;

export default bpdDetailsReducer;
