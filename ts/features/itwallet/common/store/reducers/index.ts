import { combineReducers } from "redux";
import authenticationReducer, {
  ItwAuthenticationState
} from "../../../authentication/store/reducers";

export type ItwState = {
  authentication: ItwAuthenticationState;
};

const itwReducer = combineReducers({
  authentication: authenticationReducer
});

export default itwReducer;
