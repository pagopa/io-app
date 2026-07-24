import { combineReducers } from "redux";

import { Action } from "../../../../store/actions/types";
import allPaginatedReducer from "./allPaginated";
import { AllPaginated } from "./allPaginated/types";
import { Archiving, archivingReducer } from "./archiving";
import { DetailsById, detailsByIdReducer } from "./detailsById";
import { Downloads, downloadsReducer } from "./downloads";
import { MessageGetStatus, messageGetStatusReducer } from "./messageGetStatus";
import {
  MessagePreconditionStatus,
  preconditionReducer
} from "./messagePrecondition";
import {
  messageSectionStatusReducer,
  MessageSectionStatusType
} from "./messageSectionStatus";
import paginatedByIdReducer, { PaginatedById } from "./paginatedById";
import { MultiplePaymentState, paymentsReducer } from "./payments";
import { ThirdPartyById, thirdPartyByIdReducer } from "./thirdPartyById";

export type MessagesState = Readonly<{
  allPaginated: AllPaginated;
  archiving: Archiving;
  detailsById: DetailsById;
  downloads: Downloads;
  messageGetStatus: MessageGetStatus;
  paginatedById: PaginatedById;
  payments: MultiplePaymentState;
  precondition: MessagePreconditionStatus;
  sectionStatus: MessageSectionStatusType;
  thirdPartyById: ThirdPartyById;
}>;

const reducer = combineReducers<MessagesState, Action>({
  allPaginated: allPaginatedReducer,
  archiving: archivingReducer,
  detailsById: detailsByIdReducer,
  downloads: downloadsReducer,
  messageGetStatus: messageGetStatusReducer,
  paginatedById: paginatedByIdReducer,
  payments: paymentsReducer,
  precondition: preconditionReducer,
  thirdPartyById: thirdPartyByIdReducer,
  sectionStatus: messageSectionStatusReducer
});

export default reducer;
