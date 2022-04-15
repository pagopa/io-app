import * as Either from "fp-ts/lib/Either";

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
  const requests: Array<Promise<Either.Either<Failure, string>>> =
    // eslint-disable-next-line sonarjs/cognitive-complexity
    messageAttributes.map(async ({ id, isArchived, isRead }) => {
      // we only migrate non-default updates
      const needsMigration = isRead || isArchived;
      if (needsMigration) {
        try {
          const response = await upsert(id, { isArchived, isRead });

          return response
            .mapLeft(
              errors =>
                ({
                  error: new Error(readablePrivacyReport(errors)),
                  messageId: id
                } as Failure)
            )
            .chain<string>(data => {
              if (data.status === 200) {
                return Either.right<Failure, string>(id);
              }

              if (data.status === 401) {
                return Either.left<Failure, string>({
                  error: new Error("UNAUTHORIZED"),
                  messageId: id
                });
              }

              if (data.status === 500) {
                return Either.left<Failure, string>({
                  error: new Error(data?.value?.title ?? "UNKNOWN"),
                  messageId: id
                });
              }
              return Either.left<Failure, string>({
                error: new Error("UNKNOWN"),
                messageId: id
              });
            });
        } catch (error) {
          return Either.left<Failure, string>({
            error: error ?? new Error("UNKNOWN"),
            messageId: id
          });
        }
      } else {
        return Either.right<Failure, string>(id);
      }
    });

  return Promise.all(requests).then(results => {
    const migrationResult: MigrationResult = { failed: [], succeeded: [] };
    results.forEach(fulfilled => {
      fulfilled.fold(
        failure => {
          // eslint-disable-next-line functional/immutable-data
          migrationResult.failed.push(failure);
        },
        id => {
          // eslint-disable-next-line functional/immutable-data
          migrationResult.succeeded.push(id);
        }
      );
    });
    return migrationResult;
  });
}
