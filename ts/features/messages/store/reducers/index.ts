import { combineReducers } from "redux";
import { Action } from "../../../../store/actions/types";
import allPaginatedReducer, { AllPaginated } from "./allPaginated";
import { DetailsById, detailsByIdReducer } from "./detailsById";
import paginatedByIdReducer, { PaginatedById } from "./paginatedById";
import { thirdPartyByIdReducer, ThirdPartyById } from "./thirdPartyById";
import { Downloads, downloadsReducer } from "./downloads";
import { MessageGetStatus, messageGetStatusReducer } from "./messageGetStatus";
import { MultiplePaymentState, paymentsReducer } from "./payments";
import {
  MessagePreconditionStatus,
  preconditionReducer
} from "./messagePrecondition";
import { Archiving, archivingReducer } from "./archiving";
import {
  messageSectionStatusReducer,
  MessageSectionStatusType
} from "./messageSectionStatus";

export type MessagesState = Readonly<{
  allPaginated: AllPaginated;
  archiving: Archiving;
  detailsById: DetailsById;
  downloads: Downloads;
  messageGetStatus: MessageGetStatus;
  paginatedById: PaginatedById;
  payments: MultiplePaymentState;
  precondition: MessagePreconditionStatus;
  thirdPartyById: ThirdPartyById;
  sectionStatus: MessageSectionStatusType;
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
