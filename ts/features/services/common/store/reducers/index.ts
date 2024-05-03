import { combineReducers } from "redux";
import homeReducer, { ServicesHomeState } from "../../../home/store/reducers";
import institutionReducer, {
  InstitutionState
} from "../../../institution/store/reducers";

export type ServicesState = {
  home: ServicesHomeState;
  institution: InstitutionState;
};

const servicesReducer = combineReducers({
  home: homeReducer,
  institution: institutionReducer
});

export default servicesReducer;
