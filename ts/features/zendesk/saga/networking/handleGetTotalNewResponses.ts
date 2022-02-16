import { call, put, race, select, take } from "redux-saga/effects";
import { delay, SagaReturnType } from "@redux-saga/core/effects";
import * as pot from "italia-ts-commons/lib/pot";
import { fromNullable, Option } from "fp-ts/lib/Option";
import { getError } from "../../../../utils/errors";

import {
  AnonymousIdentity,
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
import { InitializedProfile } from "../../../../../definitions/backend/InitializedProfile";
import {
  profileSelector,
  ProfileState
} from "../../../../store/reducers/profile";
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

// retrieve the number of ticket opened by the user from the Zendesk SDK
export function* handleGetTotalNewResponses() {
  while (true) {
    const zendeskToken: string | undefined = yield select(zendeskTokenSelector);
    const profile: ProfileState = yield select(profileSelector);
    const maybeProfile: Option<InitializedProfile> = pot.toOption(profile);

    const zendeskConfig: ZendeskAppConfig = zendeskToken
      ? { ...zendeskDefaultJwtConfig, token: zendeskToken }
      : zendeskDefaultAnonymousConfig;

    yield call(initSupportAssistance, zendeskConfig);
    const zendeskIdentity: JwtIdentity | AnonymousIdentity = fromNullable(
      zendeskToken
    )
      .map((zT: string): JwtIdentity | AnonymousIdentity => ({
        token: zT
      }))
      .alt(
        maybeProfile.map(
          (mP: InitializedProfile): AnonymousIdentity => ({
            name: mP.name,
            email: mP.email
          })
        )
      )
      .getOrElse({});

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
}
