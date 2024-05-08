import { combineReducers } from "redux";
import identificationReducer, {
  ItwIdentificationState
} from "../../../identification/store/reducers";

export type ItwState = {
  identification: ItwIdentificationState;
};

const itwReducer = combineReducers({
  identification: identificationReducer
});

export default itwReducer;
