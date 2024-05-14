import { combineReducers } from "redux";
import homeReducer, { ServicesHomeState } from "../../../home/store/reducers";
import institutionReducer, {
  InstitutionState
} from "../../../institution/store/reducers";
import searchReducer, { SearchState } from "../../../search/store/reducers";

export type ServicesState = {
  home: ServicesHomeState;
  institution: InstitutionState;
  search: SearchState;
};

const servicesReducer = combineReducers({
  home: homeReducer,
  institution: institutionReducer,
  search: searchReducer
});

export default servicesReducer;
