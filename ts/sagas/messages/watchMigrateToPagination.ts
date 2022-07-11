import { ValidationError } from "io-ts";
import { call, put, takeLatest } from "typed-redux-saga/macro";
import { ActionType, getType } from "typesafe-actions";
import { MessageStatusArchivingChange } from "../../../definitions/backend/MessageStatusArchivingChange";
import { MessageStatusBulkChange } from "../../../definitions/backend/MessageStatusBulkChange";
import { BackendClient } from "../../api/backend";
import migrateToPagination from "../../boot/migrateToPagination";
import {
  migrateToPaginatedMessages,
  removeMessages
} from "../../store/actions/messages";
import { MessageStatus } from "../../store/reducers/entities/messages/messagesStatus";
import { ReduxSagaEffect, SagaCallReturnType } from "../../types/utils";
import { isTestEnv } from "../../utils/environment";
import { readablePrivacyReport } from "../../utils/reporters";

type LocalActionType = ActionType<typeof migrateToPaginatedMessages["request"]>;
type LocalBeClient = ReturnType<
  typeof BackendClient
>["upsertMessageStatusAttributes"];

export default function* watcher(
  putMessages: LocalBeClient
): Generator<ReduxSagaEffect, void, SagaCallReturnType<typeof putMessages>> {
  yield* takeLatest(
    getType(migrateToPaginatedMessages.request),
    tryMigration(putMessages)
  );
}

function tryMigration(putMessages: LocalBeClient) {
  return function* gen(
    action: LocalActionType
  ): Generator<ReduxSagaEffect, void, SagaCallReturnType<typeof putMessages>> {
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
  };
}

export const testTryLoadPreviousPageMessages = isTestEnv
  ? tryMigration
  : undefined;
