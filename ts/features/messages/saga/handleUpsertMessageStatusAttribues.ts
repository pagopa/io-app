import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { MessageStatusArchivingChange } from "../../../../definitions/backend/MessageStatusArchivingChange";
import { MessageStatusBulkChange } from "../../../../definitions/backend/MessageStatusBulkChange";
import { MessageStatusChange } from "../../../../definitions/backend/MessageStatusChange";
import { MessageStatusReadingChange } from "../../../../definitions/backend/MessageStatusReadingChange";
import { BackendClient } from "../../../api/backend";
import {
  upsertMessageStatusAttributes,
  UpsertMessageStatusAttributesPayload
} from "../store/actions";
import { SagaCallReturnType } from "../../../types/utils";
import { getError } from "../../../utils/errors";
import { withRefreshApiCall } from "../../fastLogin/saga/utils";
import { errorToReason, unknownToReason } from "../utils";
import { trackUpsertMessageStatusAttributesFailure } from "../analytics";
import { handleResponse } from "../utils/responseHandling";

/**
 * @throws invalid payload
 * @param payload
 */
function validatePayload(
  payload: UpsertMessageStatusAttributesPayload
): MessageStatusChange {
  switch (payload.update.tag) {
    case "archiving":
      return {
        change_type: "archiving",
        is_archived: payload.update.isArchived
      } as MessageStatusArchivingChange;
    case "reading":
      return {
        change_type: "reading",
        is_read: true
      } as MessageStatusReadingChange;
    case "bulk":
      return {
        change_type: "bulk",
        is_read: true,
        is_archived: payload.update.isArchived
      } as MessageStatusBulkChange;
    default:
      throw new TypeError("invalid payload");
  }
}

export function* handleUpsertMessageStatusAttribues(
  putMessage: BackendClient["upsertMessageStatusAttributes"],
  action: ActionType<(typeof upsertMessageStatusAttributes)["request"]>
) {
  try {
    const body = validatePayload(action.payload);
    const response = (yield* call(
      withRefreshApiCall,
      putMessage({ id: action.payload.message.id, body }),
      action
    )) as unknown as SagaCallReturnType<typeof putMessage>;

    const nextAction = handleResponse<unknown>(
      response,
      _ => upsertMessageStatusAttributes.success(action.payload),
      error => {
        const reason = errorToReason(error);
        trackUpsertMessageStatusAttributesFailure(reason);
        return upsertMessageStatusAttributes.failure({
          error: getError(error),
          payload: action.payload
        });
      }
    );

    if (nextAction) {
      yield* put(nextAction);
    }
  } catch (error) {
    const reason = unknownToReason(error);
    trackUpsertMessageStatusAttributesFailure(reason);
    yield* put(
      upsertMessageStatusAttributes.failure({
        error: getError(error),
        payload: action.payload
      })
    );
  }
}
