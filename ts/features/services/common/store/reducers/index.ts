import { combineReducers } from "redux";
import homeReducer, { ServicesHomeState } from "../../../home/store/reducers";
import institutionReducer, {
  InstitutionState
} from "../../../institution/store/reducers";
import searchReducer, { SearchState } from "../../../search/store/reducers";
import servicesDetailsReducer, {
  ServicesDetailsState
} from "../../../details/store/reducers";

export type ServicesState = {
  details: ServicesDetailsState;
  home: ServicesHomeState;
  institution: InstitutionState;
  search: SearchState;
};

const servicesReducer = combineReducers({
  details: servicesDetailsReducer,
  home: homeReducer,
  institution: institutionReducer,
  search: searchReducer
});

export default servicesReducer;
