/**
 * Messages combined reducer
 */

import { combineReducers } from "redux";

import { Action } from "../../../actions/types";

import messagesByIdReducer, {
  MessageState,
  MessageStateById
} from "./messagesById";
import { MessageStatus } from "./messagesStatus";
import allPaginatedReducer, { AllPaginated } from "./allPaginated";
import detailsByIdReducer, { DetailsById } from "./detailsById";
import paginatedByIdReducer, { PaginatedById } from "./paginatedById";
import { thirdPartyByIdReducer, ThirdPartyById } from "./thirdPartyById";

export type MessagesState = Readonly<{
  byId: MessageStateById;
  allPaginated: AllPaginated;
  paginatedById: PaginatedById;
  detailsById: DetailsById;
  thirdPartyById: ThirdPartyById;
}>;

const reducer = combineReducers<MessagesState, Action>({
  byId: messagesByIdReducer,
  allPaginated: allPaginatedReducer,
  paginatedById: paginatedByIdReducer,
  detailsById: detailsByIdReducer,
  thirdPartyById: thirdPartyByIdReducer
});

// this type is need to combine message data to message status. Note
// that message status is a data held only by the app (isRead / isArchived)
export type MessagesStateAndStatus = MessageState & MessageStatus;

export default reducer;
