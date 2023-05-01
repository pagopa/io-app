/**
 * Messages combined reducer
 */

import { combineReducers } from "redux";

import { Action } from "../../../actions/types";

import allPaginatedReducer, { AllPaginated } from "./allPaginated";
import detailsByIdReducer, { DetailsById } from "./detailsById";
import paginatedByIdReducer, { PaginatedById } from "./paginatedById";
import { thirdPartyByIdReducer, ThirdPartyById } from "./thirdPartyById";
import { Downloads, downloadsReducer } from "./downloads";
import {
  MessagePrecondition,
  messagePreconditionReducer
} from "./messagePrecondition";

export type MessagesState = Readonly<{
  allPaginated: AllPaginated;
  paginatedById: PaginatedById;
  detailsById: DetailsById;
  thirdPartyById: ThirdPartyById;
  downloads: Downloads;
  messagePrecondition: MessagePrecondition;
}>;

const reducer = combineReducers<MessagesState, Action>({
  allPaginated: allPaginatedReducer,
  paginatedById: paginatedByIdReducer,
  detailsById: detailsByIdReducer,
  thirdPartyById: thirdPartyByIdReducer,
  downloads: downloadsReducer,
  messagePrecondition: messagePreconditionReducer
});

export default reducer;
