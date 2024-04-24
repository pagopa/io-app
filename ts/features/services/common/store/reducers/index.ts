import { combineReducers } from "redux";
import homeReducer, { ServicesHomeState } from "../../../home/store/reducers";

export type ServicesState = {
  home: ServicesHomeState;
};

const servicesReducer = combineReducers({
  home: homeReducer
});

export default servicesReducer;
