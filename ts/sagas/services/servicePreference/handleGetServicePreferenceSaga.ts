import { delay, put } from "redux-saga/effects";
import { ActionType } from "typesafe-actions";
import { loadServicePreference } from "../../../store/actions/services/servicePreference";

export function* handleGetServicePreference(
  /* TODO add the API client when defined */
  action: ActionType<typeof loadServicePreference.request>
) {
  yield delay(100);

  yield put(
    loadServicePreference.success({
      id: action.payload,
      kind: "success",
      value: {
        inbox: true,
        notifications: false,
        email: true
      }
    })
  );
}
