/**
 * Messages combined reducer
 */

import { combineReducers } from "redux";

import { Action } from "../../../../store/actions/types";

import allPaginatedReducer, { AllPaginated } from "./allPaginated";
import { DetailsById, detailsByIdReducer } from "./detailsById";
import paginatedByIdReducer, { PaginatedById } from "./paginatedById";
import { thirdPartyByIdReducer, ThirdPartyById } from "./thirdPartyById";
import { Downloads, downloadsReducer } from "./downloads";
import {
  MessagePrecondition,
  messagePreconditionReducer
} from "./messagePrecondition";
import { MessageGetStatus, messageGetStatusReducer } from "./messageGetStatus";
import { MultiplePaymentState, paymentsReducer } from "./payments";

export type MessagesState = Readonly<{
  allPaginated: AllPaginated;
  paginatedById: PaginatedById;
  detailsById: DetailsById;
  thirdPartyById: ThirdPartyById;
  downloads: Downloads;
  messagePrecondition: MessagePrecondition;
  messageGetStatus: MessageGetStatus;
  payments: MultiplePaymentState;
}>;

const reducer = combineReducers<MessagesState, Action>({
  allPaginated: allPaginatedReducer,
  paginatedById: paginatedByIdReducer,
  detailsById: detailsByIdReducer,
  thirdPartyById: thirdPartyByIdReducer,
  downloads: downloadsReducer,
  messagePrecondition: messagePreconditionReducer,
  messageGetStatus: messageGetStatusReducer,
  payments: paymentsReducer
});

export default reducer;
