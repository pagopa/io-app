import { combineReducers } from "redux";
import { Action } from "../actions/types";
import zendeskReducer, {
  ZendeskState
} from "../../features/zendesk/store/reducers";

export type AssistanceToolsState = {
  zendesk: ZendeskState;
};

const assistanceToolsReducer = combineReducers<AssistanceToolsState, Action>({
  zendesk: zendeskReducer
});

export default assistanceToolsReducer;
