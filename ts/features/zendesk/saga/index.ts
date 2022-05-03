// watch for all actions regarding Zendesk
import { takeLatest } from "typed-redux-saga/macro";
import {
  getZendeskConfig,
  zendeskRequestTicketNumber,
  zendeskSupportStart
} from "../store/actions";
import { ContentClient } from "../../../api/content";
import { dismissSupport } from "../../../utils/supportAssistance";
import { identificationRequest } from "../../../store/actions/identification";
import { zendeskSupport } from "./orchestration";
import { handleGetZendeskConfig } from "./networking/handleGetZendeskConfig";
import { handleHasOpenedTickets } from "./networking/handleHasOpenedTickets";

export function* watchZendeskSupportSaga() {
  const contentClient = ContentClient();
  // start zendesk support management
  yield* takeLatest(zendeskSupportStart, zendeskSupport);

  yield* takeLatest(
    getZendeskConfig.request,
    handleGetZendeskConfig,
    contentClient.getZendeskConfig
  );

  yield* takeLatest(zendeskRequestTicketNumber.request, handleHasOpenedTickets);
  // close the Zendesk support UI when the identification is requested
  // this is due since there is a modal clash (iOS only) see https://pagopa.atlassian.net/browse/IABT-1348?filter=10121
  yield* takeLatest(identificationRequest, () => {
    dismissSupport();
  });
}
