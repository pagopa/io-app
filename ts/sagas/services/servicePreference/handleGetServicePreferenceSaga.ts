import { call, put } from "redux-saga/effects";
import { ActionType } from "typesafe-actions";
import { loadServicePreference } from "../../../store/actions/services/servicePreference";
import { BackendClient } from "../../../api/backend";
import { SagaCallReturnType } from "../../../types/utils";
import { getGenericError, getNetworkError } from "../../../utils/errors";
import { ServicePreferenceResponseFailure } from "../../../types/services/ServicePreferenceResponse";
import { readablePrivacyReport } from "../../../utils/reporters";

export const mapKinds: Record<
  number,
  ServicePreferenceResponseFailure["kind"]
> = {
  409: "conflictingVersion",
  404: "notFound",
  429: "tooManyRequests"
};

/**
 * saga to handle the load of service preferences for a specific service
 * @param getServicePreference
 * @param action
 */
export function* handleGetServicePreference(
  getServicePreference: ReturnType<
    typeof BackendClient
  >["getServicePreference"],
  action: ActionType<typeof loadServicePreference.request>
) {
  try {
    const response: SagaCallReturnType<typeof getServicePreference> =
      yield call(getServicePreference, { service_id: action.payload });

    if (response.isRight()) {
      if (response.value.status === 200) {
        yield put(
          loadServicePreference.success({
            id: action.payload,
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
          loadServicePreference.success({
            id: action.payload,
            kind: mapKinds[response.value.status]
          })
        );
        return;
      }
      // not handled error codes
      yield put(
        loadServicePreference.failure({
          id: action.payload,
          ...getGenericError(
            new Error(`response status code ${response.value.status}`)
          )
        })
      );
      return;
    }
    // cannot decode response
    yield put(
      loadServicePreference.failure({
        id: action.payload,
        ...getGenericError(new Error(readablePrivacyReport(response.value)))
      })
    );
  } catch (e) {
    yield put(
      loadServicePreference.failure({
        id: action.payload,
        ...getNetworkError(e)
      })
    );
  }
}
