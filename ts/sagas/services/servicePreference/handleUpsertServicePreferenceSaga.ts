import * as pot from "@pagopa/ts-commons/lib/pot";
import * as E from "fp-ts/lib/Either";
import { call, put, select } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { ServicePreference } from "../../../../definitions/backend/ServicePreference";
import { BackendClient } from "../../../api/backend";
import { upsertServicePreference } from "../../../store/actions/services/servicePreference";
import {
  servicePreferenceSelector,
  ServicePreferenceState
} from "../../../store/reducers/entities/services/servicePreference";
import { isServicePreferenceResponseSuccess } from "../../../types/services/ServicePreferenceResponse";
import { SagaCallReturnType } from "../../../types/utils";
import { getGenericError, getNetworkError } from "../../../utils/errors";
import { readablePrivacyReport } from "../../../utils/reporters";
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

      // When the `inbox` preference will be re-enabled (from false to true),
      // by default the `can_access_message_read_status` should
      // be enabled too, just like the `is_webhook_enabled`.
      can_access_message_read_status: true,

      settings_version: action.payload
        .settings_version as ServicePreference["settings_version"]
    };
  }
  return {
    is_inbox_enabled: action.payload.inbox,
    is_webhook_enabled: action.payload.inbox ? action.payload.push : false,
    is_email_enabled: action.payload.inbox ? action.payload.email : false,
    can_access_message_read_status: action.payload.inbox
      ? action.payload.can_access_message_read_status
      : false,
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
    yield* select(servicePreferenceSelector);

  const updatingPreference = calculateUpdatingPreference(
    currentPreferences,
    action
  );

  try {
    const response: SagaCallReturnType<typeof upsertServicePreferences> =
      yield* call(upsertServicePreferences, {
        service_id: action.payload.id,
        body: updatingPreference
      });

    if (E.isRight(response)) {
      if (response.right.status === 200) {
        yield* put(
          upsertServicePreference.success({
            id: action.payload.id,
            kind: "success",
            value: {
              inbox: response.right.value.is_inbox_enabled,
              push: response.right.value.is_webhook_enabled,
              email: response.right.value.is_email_enabled,

              // If the optional flag does not exists it will be set
              // as the value of `inbox`.
              can_access_message_read_status:
                response.right.value.can_access_message_read_status ??
                response.right.value.is_inbox_enabled,
              settings_version: response.right.value.settings_version
            }
          })
        );
        return;
      }

      if (mapKinds[response.right.status] !== undefined) {
        yield* put(
          upsertServicePreference.success({
            id: action.payload.id,
            kind: mapKinds[response.right.status]
          })
        );
        return;
      }
      // not handled error codes
      yield* put(
        upsertServicePreference.failure({
          id: action.payload.id,
          ...getGenericError(
            new Error(`response status code ${response.right.status}`)
          )
        })
      );
      return;
    }
    // cannot decode response
    yield* put(
      upsertServicePreference.failure({
        id: action.payload.id,
        ...getGenericError(new Error(readablePrivacyReport(response.left)))
      })
    );
  } catch (e) {
    yield* put(
      upsertServicePreference.failure({
        id: action.payload.id,
        ...getNetworkError(e)
      })
    );
  }
}
