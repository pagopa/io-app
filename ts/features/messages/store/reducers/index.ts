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
  LegacyMessagePrecondition,
  legacyMessagePreconditionReducer
} from "./legacyMessagePrecondition";
import { MessageGetStatus, messageGetStatusReducer } from "./messageGetStatus";
import { MultiplePaymentState, paymentsReducer } from "./payments";
import { MessagePreconditionStatus, preconditionReducer } from "./messagePrecondition";

export type MessagesState = Readonly<{
  allPaginated: AllPaginated;
  paginatedById: PaginatedById;
  detailsById: DetailsById;
  thirdPartyById: ThirdPartyById;
  downloads: Downloads;
  legacyMessagePrecondition: LegacyMessagePrecondition;
  messageGetStatus: MessageGetStatus;
  payments: MultiplePaymentState;
  precondition: MessagePreconditionStatus;
}>;

const reducer = combineReducers<MessagesState, Action>({
  allPaginated: allPaginatedReducer,
  paginatedById: paginatedByIdReducer,
  detailsById: detailsByIdReducer,
  thirdPartyById: thirdPartyByIdReducer,
  downloads: downloadsReducer,
  legacyMessagePrecondition: legacyMessagePreconditionReducer,
  messageGetStatus: messageGetStatusReducer,
  payments: paymentsReducer,
  precondition: preconditionReducer,
});

export default reducer;
