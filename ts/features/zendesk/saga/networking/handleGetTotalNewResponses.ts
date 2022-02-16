import { call, put, race, select, take } from "redux-saga/effects";
import { delay, SagaReturnType } from "@redux-saga/core/effects";
import { getError } from "../../../../utils/errors";

import {
  AnonymousIdentity,
  getIdentityByToken,
  getTotalNewResponses,
  getTotalNewResponsesRefreshRate,
  initSupportAssistance,
  JwtIdentity,
  setUserIdentity,
  ZendeskAppConfig,
  zendeskDefaultAnonymousConfig,
  zendeskDefaultJwtConfig
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
  zendeskRequestTicketNumber
} from "../../store/actions";
import { isTestEnv } from "../../../../utils/environment";

function* totalNewResponsesFunction() {
  const zendeskToken: string | undefined = yield select(zendeskTokenSelector);

  const zendeskConfig: ZendeskAppConfig = zendeskToken
    ? { ...zendeskDefaultJwtConfig, token: zendeskToken }
    : zendeskDefaultAnonymousConfig;

  yield call(initSupportAssistance, zendeskConfig);
  const zendeskIdentity: JwtIdentity | AnonymousIdentity =
    getIdentityByToken(zendeskToken);

  yield call(setUserIdentity, zendeskIdentity);

  // Try to get the total messages of the user
  yield put(zendeskRequestTicketNumber.request());

  // Try to get the new messages of the user
  try {
    const response: SagaReturnType<typeof getTotalNewResponses> = yield call(
      getTotalNewResponses
    );
    yield put(zendeskGetTotalNewResponses.success(response));
  } catch (e) {
    yield put(zendeskGetTotalNewResponses.failure(getError(e)));
  }
  yield race({
    wait: delay(getTotalNewResponsesRefreshRate),
    signals: take([
      sessionInvalid,
      sessionExpired,
      logoutRequest,
      sessionInformationLoadSuccess
    ])
  });
}

// retrieve the number of ticket opened by the user from the Zendesk SDK
export function* handleGetTotalNewResponses() {
  while (true) {
    yield call(totalNewResponsesFunction);
  }
}

export const testTotalNewResponsesFunction = isTestEnv
  ? totalNewResponsesFunction
  : undefined;
