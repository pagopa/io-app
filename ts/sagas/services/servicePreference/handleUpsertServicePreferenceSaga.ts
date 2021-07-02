import { call, put } from "redux-saga/effects";
import { ActionType } from "typesafe-actions";
import { readableReport } from "italia-ts-commons/lib/reporters";
import { upsertServicePreference } from "../../../store/actions/services/servicePreference";
import { BackendClient } from "../../../api/backend";
import { SagaCallReturnType } from "../../../types/utils";
import { getNetworkError } from "../../../utils/errors";
import { ServicePreference } from "../../../../definitions/backend/ServicePreference";
import { mapKinds } from "./handleGetServicePreferenceSaga";

export function* handleUpsertServicePreference(
  upsertServicePreferences: ReturnType<
    typeof BackendClient
  >["upsertServicePreference"],
  action: ActionType<typeof upsertServicePreference.request>
) {
  try {
    const updatingPreference: ServicePreference = {
      is_inbox_enabled: action.payload.inbox,
      is_webhook_enabled: action.payload.inbox ? action.payload.push : false,
      is_email_enabled: action.payload.inbox ? action.payload.email : false,
      settings_version: action.payload
        .settings_version as ServicePreference["settings_version"]
    };

    const response: SagaCallReturnType<typeof upsertServicePreferences> = yield call(
      upsertServicePreferences,
      {
        service_id: action.payload.id,
        servicePreference: updatingPreference
      }
    );

    if (response.isLeft()) {
      yield put(
        upsertServicePreference.failure({
          id: action.payload.id,
          kind: "generic",
          value: new Error(readableReport(response.value))
        })
      );
      return;
    }
    if (response.value.status === 200) {
      yield put(
        upsertServicePreference.success({
          id: action.payload.id,
          kind: "success",
          value: {
            inbox: response.value.value.is_inbox_enabled,
            push: response.value.value.is_webhook_enabled,
            email: response.value.value.is_email_enabled,
            settings_version: response.value.value.settings_version
          }
        })
      );
      return;
    }

    yield put(
      upsertServicePreference.success({
        id: action.payload.id,
        kind: mapKinds[response.value.status]
      })
    );
  } catch (e) {
    yield put(
      upsertServicePreference.failure({
        id: action.payload.id,
        ...getNetworkError(e)
      })
    );
  }
}
