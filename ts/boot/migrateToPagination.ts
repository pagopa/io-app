import * as Either from "fp-ts/lib/Either";

import { MessageStatus } from "../store/reducers/entities/messages/messagesStatus";
import { readablePrivacyReport } from "../utils/reporters";

type Failure = {
  error: unknown;
  messageId: string;
};

type MigrationResult = {
  failed: Array<Failure>;
  succeeded: Array<string>;
};

export default async function init(
  messageAttributes: Array<{
    id: string;
    isRead: boolean;
    isArchived: boolean;
  }>,
  upsert: (id: string, messageStatus: MessageStatus) => Promise<unknown>
): Promise<MigrationResult> {
  const requests: Array<Promise<Either.Either<Failure, string>>> =
    messageAttributes.map(async ({ id, isArchived, isRead }) => {
      // we only migrate non-default updates
      const needsMigration = isRead || isArchived;
      if (needsMigration) {
        try {
          await upsert(id, { isArchived, isRead });
          return Either.right<Failure, string>(id);
        } catch (error) {
          return Either.left<Failure, string>({
            error: readablePrivacyReport(error),
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
    // store.dispatch(removeMessages(migrationResult.succeeded));
    return migrationResult;
  });

  // TODO: dispatch to remove the loader
}
