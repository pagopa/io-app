import * as pot from "italia-ts-commons/lib/pot";
import { TypeofApiCall } from "italia-ts-commons/lib/requests";
import { Effect } from "redux-saga";
import { call, put, select, take } from "redux-saga/effects";
import { getType } from "typesafe-actions";

import { UpsertProfileT } from "../../../definitions/backend/requestTypes";
import { tosVersion } from "../../config";
import { createOrUpdateProfileSaga } from "../../sagas/profile";
import { navigateToTosScreen } from "../../store/actions/navigation";
import { tosAccept } from "../../store/actions/onboarding";
import { profileUpsert } from "../../store/actions/profile";
import { profileSelector } from "../../store/reducers/profile";
import { GlobalState } from "../../store/reducers/types";

export function* checkAcceptedTosSaga(
  createOrUpdateProfile: TypeofApiCall<UpsertProfileT>
): IterableIterator<Effect> {
  const profileState: ReturnType<typeof profileSelector> = yield select<
    GlobalState
  >(profileSelector);

  if (pot.isNone(profileState)) {
    return;
  }

  if (
    "accepted_tos_version" in profileState.value &&
    profileState.value.accepted_tos_version &&
    profileState.value.accepted_tos_version === tosVersion
  ) {
    return;
  }

  // Navigate to the TosScreen
  yield put(navigateToTosScreen);

  // Here we wait the user accept the ToS
  yield take(getType(tosAccept));

  // Update the user profile
  yield call(
    createOrUpdateProfileSaga,
    createOrUpdateProfile,
    profileUpsert.request({ accepted_tos_version: tosVersion })
  );
}
