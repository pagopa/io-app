// watch for all actions regarding Zendesk
import { fork, takeLatest } from "redux-saga/effects";
import {
  getZendeskConfig,
  zendeskRequestTicketNumber,
  zendeskSupportStart
} from "../store/actions";
import { ContentClient } from "../../../api/content";
import { zendeskSupport } from "./orchestration";
import { handleGetZendeskConfig } from "./networking/handleGetZendeskConfig";
import { handleHasOpenedTickets } from "./networking/handleHasOpenedTickets";
import { handleGetTotalNewResponses } from "./networking/handleGetTotalNewResponses";

export function* watchZendeskSupportSaga() {
  const contentClient = ContentClient();
  // start zendesk support management
  yield takeLatest(zendeskSupportStart, zendeskSupport);

  yield takeLatest(
    getZendeskConfig.request,
    handleGetZendeskConfig,
    contentClient.getZendeskConfig
  );

  yield takeLatest(zendeskRequestTicketNumber.request, handleHasOpenedTickets);

  yield fork(handleGetTotalNewResponses);
}
