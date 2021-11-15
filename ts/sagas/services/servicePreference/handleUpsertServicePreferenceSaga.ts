import { call, put, select } from "redux-saga/effects";
import * as pot from "italia-ts-commons/lib/pot";
import { ActionType } from "typesafe-actions";
import { upsertServicePreference } from "../../../store/actions/services/servicePreference";
import { BackendClient } from "../../../api/backend";
import { SagaCallReturnType } from "../../../types/utils";
import { getGenericError, getNetworkError } from "../../../utils/errors";
import { ServicePreference } from "../../../../definitions/backend/ServicePreference";
import { readablePrivacyReport } from "../../../utils/reporters";
import {
  servicePreferenceSelector,
  ServicePreferenceState
} from "../../../store/reducers/entities/services/servicePreference";
import { isServicePreferenceResponseSuccess } from "../../../types/services/ServicePreferenceResponse";
import { mapKinds } from "./handleGetServicePreferenceSaga";

/**
 * Generates the payload for the updating preferences request, if a users disables the inbox flag than the other flags
 * are disabled.
 * If a user activates a disabled inbox flag than webhook is enabled too.
 * @param currentServicePreferenceState
 * @param action
 */
const calculateUpdatingPreference = (
  currentServicePreferenceState: ServicePreferenceState,
  action: ActionType<typeof upsertServicePreference.request>
): ServicePreference => {
  if (
    pot.isSome(currentServicePreferenceState) &&
    isServicePreferenceResponseSuccess(currentServicePreferenceState.value) &&
    !currentServicePreferenceState.value.value.inbox &&
    action.payload.inbox
  ) {
    return {
      is_inbox_enabled: action.payload.inbox,
      is_webhook_enabled: true,
      is_email_enabled: currentServicePreferenceState.value.value.email,
      settings_version: action.payload
        .settings_version as ServicePreference["settings_version"]
    };
  }
  return {
    is_inbox_enabled: action.payload.inbox,
    is_webhook_enabled: action.payload.inbox ? action.payload.push : false,
    is_email_enabled: action.payload.inbox ? action.payload.email : false,
    settings_version: action.payload
      .settings_version as ServicePreference["settings_version"]
  };
};

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
  const currentPreferences: ReturnType<typeof servicePreferenceSelector> =
    yield select(servicePreferenceSelector);

  const updatingPreference = calculateUpdatingPreference(
    currentPreferences,
    action
  );

  try {
    const response: SagaCallReturnType<typeof upsertServicePreferences> =
      yield call(upsertServicePreferences, {
        service_id: action.payload.id,
        servicePreference: updatingPreference
      });

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
