import { call, put } from "redux-saga/effects";
import { ActionType } from "typesafe-actions";
import { upsertServicePreference } from "../../../store/actions/services/servicePreference";
import { BackendClient } from "../../../api/backend";
import { SagaCallReturnType } from "../../../types/utils";
import { getGenericError, getNetworkError } from "../../../utils/errors";
import { ServicePreference } from "../../../../definitions/backend/ServicePreference";
import { readablePrivacyReport } from "../../../utils/reporters";
import { mapKinds } from "./handleGetServicePreferenceSaga";

/**
 * saga to handle the update of service preferences after a user specific action
 * @param upsertServicePreferences
 * @param action
 */
export function* handleUpsertServicePreference(
  upsertServicePreferences: ReturnType<
    typeof BackendClient
  >["upsertServicePreference"],
  action: ActionType<typeof upsertServicePreference.request>
) {
  try {
    // payload of the updating service preference
    // if the inbox is set to false automatically we set to false all the other channels
    // to prevent inconsistent statuses
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

    if (response.isRight()) {
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

      if (mapKinds[response.value.status] !== undefined) {
        yield put(
          upsertServicePreference.success({
            id: action.payload.id,
            kind: mapKinds[response.value.status]
          })
        );
        return;
      }
      // not handled error codes
      yield put(
        upsertServicePreference.failure({
          id: action.payload.id,
          ...getGenericError(
            new Error(`response status code ${response.value.status}`)
          )
        })
      );
      return;
    }
    // cannot decode response
    yield put(
      upsertServicePreference.failure({
        id: action.payload.id,
        ...getGenericError(new Error(readablePrivacyReport(response.value)))
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
