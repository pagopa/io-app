import { call, put } from "redux-saga/effects";
import { ActionType } from "typesafe-actions";
import { readableReport } from "italia-ts-commons/lib/reporters";
import { loadServicePreference } from "../../../store/actions/services/servicePreference";
import { BackendClient } from "../../../api/backend";
import { SagaCallReturnType } from "../../../types/utils";
import { getNetworkError } from "../../../utils/errors";
import { ServicePreferenceResponseFailure } from "../../../types/services/ServicePreferenceResponse";

export const mapKinds: Record<
  number,
  ServicePreferenceResponseFailure["kind"]
> = {
  409: "conflictingVersion",
  404: "notFound",
  429: "tooManyRequests"
};

export function* handleGetServicePreference(
  getServicePreference: ReturnType<
    typeof BackendClient
  >["getServicePreference"],
  action: ActionType<typeof loadServicePreference.request>
) {
  try {
    const response: SagaCallReturnType<typeof getServicePreference> = yield call(
      getServicePreference,
      { service_id: action.payload }
    );

    if (response.isLeft()) {
      yield put(
        loadServicePreference.failure({
          id: action.payload,
          kind: "generic",
          value: new Error(readableReport(response.value))
        })
      );
      return;
    }
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

    yield put(
      loadServicePreference.success({
        id: action.payload,
        kind: mapKinds[response.value.status]
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
