import * as E from "fp-ts/lib/Either";

import { pipe } from "fp-ts/lib/function";
import { MessageStatus } from "../store/reducers/entities/messages/messagesStatus";
import { readablePrivacyReport } from "../utils/reporters";
import { BackendClient } from "../api/backend";

type Failure = {
  error: unknown;
  messageId: string;
};

type MigrationResult = {
  failed: Array<Failure>;
  succeeded: Array<string>;
};

export type ResponseType = ReturnType<
  ReturnType<typeof BackendClient>["upsertMessageStatusAttributes"]
>;

export default async function init(
  messageAttributes: Array<{
    id: string;
    isRead: boolean;
    isArchived: boolean;
  }>,
  upsert: (id: string, messageStatus: MessageStatus) => ResponseType
): Promise<MigrationResult> {
  const requests: Array<Promise<E.Either<Failure, string>>> =
    // eslint-disable-next-line sonarjs/cognitive-complexity
    messageAttributes.map(async ({ id, isArchived, isRead }) => {
      // we only migrate non-default updates
      const needsMigration = isRead || isArchived;
      if (needsMigration) {
        try {
          const response = await upsert(id, { isArchived, isRead });
          return pipe(
            response,
            E.mapLeft(
              errors =>
                ({
                  error: new Error(readablePrivacyReport(errors)),
                  messageId: id
                } as Failure)
            ),
            E.chain(data => {
              // If the backend returns 403 or 404, it means that the client
              // is trying to migrate a message that doesn't exist for the user
              // (e.g. dirty state in the client). In this case, as the error
              // is not recoverable by the user, we consider the migration
              // successful (i.e. nothing to migrate).
              if (
                data.status === 200 ||
                data.status === 403 ||
                data.status === 404
              ) {
                return E.right<Failure, string>(id);
              }

              if (data.status === 401) {
                return E.left<Failure, string>({
                  error: new Error("UNAUTHORIZED"),
                  messageId: id
                });
              }

              if (data.status === 500) {
                return E.left<Failure, string>({
                  error: new Error(data?.value?.title ?? "UNKNOWN"),
                  messageId: id
                });
              }
              return E.left<Failure, string>({
                error: new Error("UNKNOWN"),
                messageId: id
              });
            })
          );
        } catch (error) {
          return E.left<Failure, string>({
            error: error ?? new Error("UNKNOWN"),
            messageId: id
          });
        }
      } else {
        return E.right<Failure, string>(id);
      }
    });

  return Promise.all(requests).then(results => {
    const migrationResult: MigrationResult = { failed: [], succeeded: [] };
    results.forEach(fulfilled => {
      pipe(
        fulfilled,
        E.fold(
          failure => {
            // eslint-disable-next-line functional/immutable-data
            migrationResult.failed.push(failure);
          },
          id => {
            // eslint-disable-next-line functional/immutable-data
            migrationResult.succeeded.push(id);
          }
        )
      );
    });
    return migrationResult;
  });
}
