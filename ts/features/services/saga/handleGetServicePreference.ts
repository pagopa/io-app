import * as E from "fp-ts/lib/Either";
import { call, put, select } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { BackendClient } from "../../../api/backend";
import { loadServicePreference } from "../store/actions";
import { ServicePreferenceResponseFailure } from "../types/ServicePreferenceResponse";
import { SagaCallReturnType } from "../../../types/utils";
import { getGenericError, getNetworkError } from "../../../utils/errors";
import { readablePrivacyReport } from "../../../utils/reporters";
import { withRefreshApiCall } from "../../fastLogin/saga/utils";
import { isFastLoginEnabledSelector } from "../../fastLogin/store/selectors";

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
  getServicePreference: BackendClient["getServicePreference"],
  action: ActionType<typeof loadServicePreference.request>
) {
  try {
    const response: SagaCallReturnType<typeof getServicePreference> =
      (yield* call(
        withRefreshApiCall,
        getServicePreference({ service_id: action.payload }),
        action
      )) as unknown as SagaCallReturnType<typeof getServicePreference>;

    if (E.isRight(response)) {
      if (response.right.status === 401) {
        const isFastLoginEnabled = yield* select(isFastLoginEnabledSelector);
        if (isFastLoginEnabled) {
          return;
        }
      }

      if (response.right.status === 200) {
        yield* put(
          loadServicePreference.success({
            id: action.payload,
            kind: "success",
            value: {
              inbox: response.right.value.is_inbox_enabled,
              push: response.right.value.is_webhook_enabled,
              email: response.right.value.is_email_enabled,
              settings_version: response.right.value.settings_version,

              // This will handle the premium messages flag.
              can_access_message_read_status:
                response.right.value.can_access_message_read_status
            }
          })
        );
        return;
      }

      if (mapKinds[response.right.status] !== undefined) {
        yield* put(
          loadServicePreference.success({
            id: action.payload,
            kind: mapKinds[response.right.status]
          })
        );
        return;
      }
      // not handled error codes
      yield* put(
        loadServicePreference.failure({
          id: action.payload,
          ...getGenericError(
            new Error(`response status code ${response.right.status}`)
          )
        })
      );
      return;
    }
    // cannot decode response
    yield* put(
      loadServicePreference.failure({
        id: action.payload,
        ...getGenericError(new Error(readablePrivacyReport(response.left)))
      })
    );
  } catch (e) {
    yield* put(
      loadServicePreference.failure({
        id: action.payload,
        ...getNetworkError(e)
      })
    );
  }
}
