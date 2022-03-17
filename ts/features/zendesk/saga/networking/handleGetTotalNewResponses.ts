import {
  call,
  fork,
  put,
  race,
  select,
  take,
  delay
} from "typed-redux-saga/macro";
import { isActionOf } from "typesafe-actions";
import { getError } from "../../../../utils/errors";

import {
  AnonymousIdentity,
  getIdentityByToken,
  getTotalNewResponses,
  unreadTicketsCountRefreshRate,
  initSupportAssistance,
  JwtIdentity,
  setUserIdentity,
  ZendeskAppConfig,
  zendeskDefaultAnonymousConfig,
  zendeskDefaultJwtConfig,
  unreadTicketsCountRefreshRateWhileSupportIsOpen
} from "../../../../utils/supportAssistance";
import { zendeskTokenSelector } from "../../../../store/reducers/authentication";
import {
  logoutRequest,
  sessionExpired,
  sessionInformationLoadSuccess,
  sessionInvalid
} from "../../../../store/actions/authentication";
import {
  zendeskGetTotalNewResponses,
  zendeskRequestTicketNumber,
  zendeskSupportOpened
} from "../../store/actions";
import { isTestEnv } from "../../../../utils/environment";
import {
  versionInfoLoadFailure,
  versionInfoLoadSuccess
} from "../../../../common/versionInfo/store/actions/versionInfo";
import { backendStatusLoadSuccess } from "../../../../store/actions/backendStatus";
import { Action } from "../../../../store/actions/types";
import { SagaCallReturnType } from "../../../../types/utils";

function* setupZendesk() {
  const zendeskToken: string | undefined = yield* select(zendeskTokenSelector);

  const zendeskConfig: ZendeskAppConfig = zendeskToken
    ? { ...zendeskDefaultJwtConfig, token: zendeskToken }
    : zendeskDefaultAnonymousConfig;

  yield* call(initSupportAssistance, zendeskConfig);
  const zendeskIdentity: JwtIdentity | AnonymousIdentity = yield* call(
    getIdentityByToken,
    zendeskToken
  );

  yield* call(setUserIdentity, zendeskIdentity);
}

function* getTicketsCount() {
  yield* call(setupZendesk);
  // Try to get the total messages of the user
  yield* put(zendeskRequestTicketNumber.request());
}

function* getUnreadTicketsCount() {
  yield* call(setupZendesk);
  // Try to get the new messages of the user
  try {
    const response: SagaCallReturnType<typeof getTotalNewResponses> =
      yield* call(getTotalNewResponses);
    yield* put(zendeskGetTotalNewResponses.success(response));
  } catch (e) {
    yield* put(zendeskGetTotalNewResponses.failure(getError(e)));
  }
}

// a predicate that return true if the given action is different from all
// these ones defined in the array
const stoppersPredicate = (action: Action): boolean =>
  [
    zendeskGetTotalNewResponses.request,
    zendeskGetTotalNewResponses.success,
    zendeskGetTotalNewResponses.failure,
    zendeskRequestTicketNumber.request,
    zendeskRequestTicketNumber.failure,
    zendeskRequestTicketNumber.success,
    backendStatusLoadSuccess,
    versionInfoLoadFailure,
    versionInfoLoadSuccess
  ].every(skipAction => !isActionOf(skipAction, action));

/**
 * when the zendesk is opened it starts to check the number of unread tickets cyclically
 * it stops when the user makes some changes inside the app (ex. SCREEN_CHANGE)
 */
function* refreshUnreadTicketsCountWhileSupportIsOpen() {
  while (true) {
    yield* take(zendeskSupportOpened);
    while (true) {
      yield* call(getUnreadTicketsCount);
      const { stoppers } = yield* race({
        wait: delay(unreadTicketsCountRefreshRateWhileSupportIsOpen),
        stoppers: take(stoppersPredicate)
      });
      if (stoppers) {
        break;
      }
    }
  }
}

/**
 * check cyclically the number of unread tickets
 * the check is done when
 * - a waiting timer elapses
 * - when the user session changes (login/logout/session)
 */
function* refreshUnreadTicketsCount() {
  while (true) {
    yield* call(getUnreadTicketsCount);
    yield* call(getTicketsCount);
    yield* race({
      wait: delay(unreadTicketsCountRefreshRate),
      signals: take([
        sessionInvalid,
        sessionExpired,
        logoutRequest,
        sessionInformationLoadSuccess
      ])
    });
  }
}

// retrieve the number of ticket opened by the user from the Zendesk SDK
export function* handleGetTotalNewResponses() {
  yield* fork(refreshUnreadTicketsCount);
  yield* fork(refreshUnreadTicketsCountWhileSupportIsOpen);
}

export const testTotalNewResponsesFunction = isTestEnv
  ? {
      refreshUnreadTicketsCount,
      getUnreadTicketsCount,
      getTicketsCount,
      setupZendesk,
      handleGetTotalNewResponses,
      refreshUnreadTicketsCountWhileSupportIsOpen,
      stoppersPredicate
    }
  : undefined;
