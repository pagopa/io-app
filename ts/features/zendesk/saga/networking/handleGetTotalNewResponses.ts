import { call, select } from "redux-saga/effects";
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
import { RTron } from "../../../../boot/configureStoreAndPersistor";
import { zendeskTokenSelector } from "../../../../store/reducers/authentication";
import { InitializedProfile } from "../../../../../definitions/backend/InitializedProfile";
import {
  profileSelector,
  ProfileState
} from "../../../../store/reducers/profile";

// retrieve the number of ticket opened by the user from the Zendesk SDK
export function* handleGetTotalNewResponses() {
  // eslint-disable-next-line functional/no-let
  let zendeskToken: string | undefined;
  // eslint-disable-next-line functional/no-let
  let zendeskConfig: ZendeskAppConfig;
  // eslint-disable-next-line functional/no-let
  let zendeskIdentity: JwtIdentity | AnonymousIdentity;

  // eslint-disable-next-line functional/no-let
  let profile: ProfileState;
  // eslint-disable-next-line functional/no-let
  let maybeProfile: Option<InitializedProfile>;
  while (true) {
    zendeskToken = yield select(zendeskTokenSelector);
    profile = yield select(profileSelector);
    maybeProfile = pot.toOption(profile);

    zendeskConfig = zendeskToken
      ? { ...zendeskDefaultJwtConfig, token: zendeskToken }
      : zendeskDefaultAnonymousConfig;

    initSupportAssistance(zendeskConfig);
    zendeskIdentity = fromNullable(zendeskToken)
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
    setUserIdentity(zendeskIdentity);
    try {
      const response: SagaReturnType<typeof getTotalNewResponses> = yield call(
        getTotalNewResponses
      );
      // yield put(zendeskRequestTicketNumber.success(response));
    } catch (e) {
      // yield put(zendeskRequestTicketNumber.failure(getError(e)));
      RTron.log(getError(e));
    }
    yield delay(getTotalNewResponsesRefreshRate);
  }
}
