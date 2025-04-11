// watch for all actions regarding Zendesk
import { takeLatest, select, call, put } from "typed-redux-saga/macro";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import {
  getZendeskConfig,
  zendeskPollingIteration,
  zendeskRequestTicketNumber,
  zendeskStartPolling,
  zendeskSupportCompleted,
  zendeskSupportStart,
  getZendeskToken,
  getZendeskPaymentConfig
} from "../store/actions";
import { ContentClient } from "../../../api/content";
import { dismissSupport } from "../../../utils/supportAssistance";
import { identificationRequest } from "../../identification/store/actions";
import { zendeskGetSessionPollingRunningSelector } from "../store/reducers";
import { startTimer } from "../../../utils/timer";
import { checkSession } from "../../../features/authentication/common/saga/watchCheckSessionSaga";
import { isFastLoginEnabledSelector } from "../../authentication/fastLogin/store/selectors";
import { BackendClient } from "../../../api/backend";
import { SagaCallReturnType } from "../../../types/utils";
import {
  formatRequestedTokenString,
  getOnlyNotAlreadyExistentValues
} from "../utils";
import { withRefreshApiCall } from "../../authentication/fastLogin/saga/utils";
import { sessionInformationLoadSuccess } from "../../authentication/common/store/actions";
import { sessionInfoSelector } from "../../authentication/common/store/selectors";
import { isDevEnv } from "./../../../utils/environment";
import { zendeskSupport } from "./orchestration";
import { handleGetZendeskConfig } from "./networking/handleGetZendeskConfig";
import { handleHasOpenedTickets } from "./networking/handleHasOpenedTickets";
import { handleGetZendeskPaymentConfig } from "./networking/handleGetZendeskPaymentConfig";

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
    const checkSessionResponse = yield* call(
      checkSession,
      getSession,
      formatRequestedTokenString(),
      true
    );
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

  yield* takeLatest(
    getZendeskPaymentConfig.request,
    handleGetZendeskPaymentConfig,
    contentClient.getZendeskPaymentConfig
  );

  yield* takeLatest(zendeskRequestTicketNumber.request, handleHasOpenedTickets);
  // close the Zendesk support UI when the identification is requested
  // this is due since there is a modal clash (iOS only) see https://pagopa.atlassian.net/browse/IABT-1348?filter=10121
  yield* takeLatest(identificationRequest, () => {
    dismissSupport();
  });
}
/**
 *
 * @param getSession is the API call to get the session tokens.
 * The goal of this saga is to take Zendesk token from the BE in order to properly report to support.
 */
function* getZendeskTokenSaga(
  getSession: ReturnType<typeof BackendClient>["getSession"]
) {
  try {
    // Define the fields needed for the token request, in this case, the needed field is only 'zendeskToken'
    const fields = formatRequestedTokenString(false, ["zendeskToken"]);
    const isFastLogin = yield* select(isFastLoginEnabledSelector);

    const response = (yield* call(
      withRefreshApiCall,
      getSession({ fields }),
      getZendeskToken.request()
    )) as SagaCallReturnType<typeof getSession>;

    if (E.isLeft(response)) {
      throw Error(readableReport(response.left));
    }
    if (response.right.status === 200) {
      yield* put(getZendeskToken.success());
      const currentSessionInfo = yield* select(sessionInfoSelector);
      yield* put(
        sessionInformationLoadSuccess(
          getOnlyNotAlreadyExistentValues(
            response.right.value,
            O.isSome(currentSessionInfo) && currentSessionInfo.value
          )
        )
      );
      return;
    }
    if (!isFastLogin || response.right.status !== 401) {
      yield* put(getZendeskToken.failure());
    }
  } catch (e) {
    yield* put(getZendeskToken.failure());
  }
}

export function* watchGetZendeskTokenSaga(
  getSession: ReturnType<typeof BackendClient>["getSession"]
) {
  yield* takeLatest(getZendeskToken.request, getZendeskTokenSaga, getSession);
}
