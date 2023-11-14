// watch for all actions regarding Zendesk
import { takeLatest, select, call, put } from "typed-redux-saga/macro";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import {
  getZendeskConfig,
  zendeskPollingIteration,
  zendeskRequestTicketNumber,
  zendeskStartPolling,
  zendeskSupportCompleted,
  zendeskSupportStart
} from "../store/actions";
import { ContentClient } from "../../../api/content";
import { dismissSupport } from "../../../utils/supportAssistance";
import { identificationRequest } from "../../../store/actions/identification";
import { zendeskGetSessionPollingRunningSelector } from "../store/reducers";
import { startTimer } from "../../../utils/timer";
import { checkSession } from "../../../sagas/startup/watchCheckSessionSaga";
import { isFastLoginEnabledSelector } from "../../fastLogin/store/selectors";
import { BackendClient } from "../../../api/backend";
import { isDevEnv } from "./../../../utils/environment";
import { zendeskSupport } from "./orchestration";
import { handleGetZendeskConfig } from "./networking/handleGetZendeskConfig";
import { handleHasOpenedTickets } from "./networking/handleHasOpenedTickets";

const ZENDESK_GET_SESSION_POLLING_INTERVAL = ((isDevEnv ? 10 : 60) *
  1000) as Millisecond;

function* zendeskGetSessionPollingLoop(
  getSession: ReturnType<typeof BackendClient>["getSession"]
) {
  // eslint-disable-next-line functional/no-let
  let zendeskPollingIsRunning = true;
  yield* put(zendeskStartPolling());
  while (zendeskPollingIsRunning) {
    yield* put(zendeskPollingIteration());
    // We start waiting to avoid action dispatching sync issues
    yield* call(startTimer, ZENDESK_GET_SESSION_POLLING_INTERVAL);
    // check if the current session is still valid
    const checkSessionResponse = yield* call(checkSession, getSession);
    if (checkSessionResponse === 401) {
      break;
    }
    zendeskPollingIsRunning = yield* select(
      zendeskGetSessionPollingRunningSelector
    );
  }
}

export function* watchZendeskGetSessionSaga(
  getSession: ReturnType<typeof BackendClient>["getSession"]
) {
  const isFastLoginEnabled = yield* select(isFastLoginEnabledSelector);
  if (isFastLoginEnabled) {
    // `zendeskSupportCompleted` identifies that
    // the user has successfully completed the zendesk ticket request
    yield* takeLatest(
      zendeskSupportCompleted,
      zendeskGetSessionPollingLoop,
      getSession
    );
  }
}

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
