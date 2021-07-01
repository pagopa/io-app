import { delay, put } from "redux-saga/effects";
import { ActionType } from "typesafe-actions";
import { upsertServicePreference } from "../../../store/actions/services/servicePreference";

export function* handleUpsertServicePreference(
  /* TODO add the API client when defined */
  action: ActionType<typeof upsertServicePreference.request>
) {
  yield delay(100);

  const { id, ...payload } = action.payload;
  yield put(
    upsertServicePreference.success({
      id,
      kind: "success",
      value: payload
    })
  );
}
