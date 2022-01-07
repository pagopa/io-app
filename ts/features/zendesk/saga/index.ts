// watch for all actions regarding Zendesk
import { takeLatest } from "redux-saga/effects";
import {
  getZendeskConfig,
  zendeskRequestTicketNumber,
  zendeskSupportStart
} from "../store/actions";
import { ContentClient } from "../../../api/content";
import { zendeskSupport } from "./orchestration";
import { handleGetZendeskConfig } from "./networking/handleGetZendeskConfig";
import { handleHasOpenedTickets } from "./networking/handleHasOpenedTickets";

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
}
