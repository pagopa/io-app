import { combineReducers } from "redux";
import homeReducer, { ServicesHomeState } from "../../../home/store/reducers";
import institutionReducer, {
  ServicesInstitutionState
} from "../../../institution/store/reducers";

export type ServicesState = {
  home: ServicesHomeState;
  institution: ServicesInstitutionState;
};

const servicesReducer = combineReducers({
  home: homeReducer,
  institution: institutionReducer
});

export default servicesReducer;
