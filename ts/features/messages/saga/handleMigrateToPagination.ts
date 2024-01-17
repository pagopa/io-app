import { ValidationError } from "io-ts";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { MessageStatusArchivingChange } from "../../../../definitions/backend/MessageStatusArchivingChange";
import { MessageStatusBulkChange } from "../../../../definitions/backend/MessageStatusBulkChange";
import { BackendClient } from "../../../api/backend";
import migrateToPagination from "../utils/migrateToPagination";
import { migrateToPaginatedMessages, removeMessages } from "../store/actions";
import { MessageStatus } from "../store/reducers/messagesStatus";
import { readablePrivacyReport } from "../../../utils/reporters";

export function* handleMigrateToPagination(
  putMessages: BackendClient["upsertMessageStatusAttributes"],
  action: ActionType<typeof migrateToPaginatedMessages.request>
) {
  try {
    const { bogus, toMigrate } = Object.keys(action.payload).reduce<{
      bogus: Array<string>;
      toMigrate: Array<{ id: string; isArchived: boolean; isRead: boolean }>;
    }>(
      (acc, id) => {
        const status = action.payload[id];
        if (status && (status.isRead || status.isArchived)) {
          return {
            ...acc,
            toMigrate: [
              ...acc.toMigrate,
              {
                id,
                isRead: status.isRead,
                isArchived: status.isArchived
              } as {
                id: string;
                isArchived: boolean;
                isRead: boolean;
              }
            ]
          };
        }
        return { ...acc, bogus: [...acc.bogus, id] };
      },
      { bogus: [], toMigrate: [] }
    );

    if (toMigrate.length === 0) {
      yield* put(removeMessages(bogus));
      yield* put(migrateToPaginatedMessages.success(0));
      return;
    }

    const { failed, succeeded } = yield* call(
      migrateToPagination,
      toMigrate,
      (id: string, { isRead, isArchived }: MessageStatus) => {
        if (isRead) {
          return putMessages({
            id,
            body: {
              change_type: "bulk",
              is_read: true,
              is_archived: isArchived
            } as MessageStatusBulkChange
          });
        }
        return putMessages({
          id,
          body: {
            change_type: "archiving",
            is_archived: isArchived
          } as MessageStatusArchivingChange
        });
      }
    );

    yield* put(removeMessages(succeeded.concat(bogus)));

    if (failed.length === 0) {
      yield* put(migrateToPaginatedMessages.success(succeeded.length));
    } else {
      yield* put(migrateToPaginatedMessages.failure({ succeeded, failed }));
    }
  } catch (e) {
    // assuming the worst, no messages were migrated because of an unexpected failure
    const errorPayload = {
      succeeded: [],
      failed: Object.keys(action.payload).map(id => ({
        messageId: id,

        // FIXME: This is potentially unsafe.
        error: readablePrivacyReport(e as Array<ValidationError>)
      }))
    };
    yield* put(migrateToPaginatedMessages.failure(errorPayload));
  }
}
