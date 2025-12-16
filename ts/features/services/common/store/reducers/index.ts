import { combineReducers } from "redux";
import { PersistPartial } from "redux-persist";
import homeReducer, { ServicesHomeState } from "../../../home/store/reducers";
import institutionReducer, {
  InstitutionState
} from "../../../institution/store/reducers";
import searchReducer, { SearchState } from "../../../search/store/reducers";
import servicesDetailsReducer, {
  ServicesDetailsState
} from "../../../details/store/reducers";
import favouriteServicesReducer, {
  FavouriteServicesState
} from "../../../favouriteServices/store/reducers";

export type ServicesState = {
  details: ServicesDetailsState;
  favouriteServices: FavouriteServicesState & PersistPartial;
  home: ServicesHomeState;
  institution: InstitutionState;
  search: SearchState;
};

const servicesReducer = combineReducers({
  details: servicesDetailsReducer,
  favouriteServices: favouriteServicesReducer,
  home: homeReducer,
  institution: institutionReducer,
  search: searchReducer
});

export default servicesReducer;
