import * as Either from "fp-ts/lib/Either";

import {
  messagesStatusSelector,
  MessageStatus
} from "../store/reducers/entities/messages/messagesStatus";
import { Store } from "../store/actions/types";
import { removeMessages } from "../store/actions/messages";

type Failure = {
  error: unknown;
  messageId: string;
};

type MigrationResult = {
  failed: Array<Failure>;
  succeeded: Array<string>;
};

export default async function init(
  store: Store,
  upsert: (id: string, messageStatus: MessageStatus) => Promise<void>
): Promise<MigrationResult> {
  const data = messagesStatusSelector(store.getState());
  const allIds = Object.keys(data);
  if (allIds.length < 1) {
    return { failed: [], succeeded: [] };
  }
  // TODO: dispatch to show the loader

  const requests: Array<Promise<Either.Either<Failure, string>>> = allIds.map(
    async id => {
      const messageStatus = data[id];
      if (messageStatus) {
        try {
          await upsert(id, messageStatus);
          return Either.right<Failure, string>(id);
        } catch (error) {
          return Either.left<Failure, string>({ error, messageId: id });
        }
      } else {
        return Either.right<Failure, string>(id);
      }
    }
  );

  return Promise.allSettled(requests).then(results => {
    const migrationResult: MigrationResult = { failed: [], succeeded: [] };
    results.forEach(fulfilled => {
      if (fulfilled.status === "fulfilled") {
        fulfilled.value.fold(
          failure => {
            // eslint-disable-next-line functional/immutable-data
            migrationResult.failed.push(failure);
          },
          id => {
            // eslint-disable-next-line functional/immutable-data
            migrationResult.succeeded.push(id);
          }
        );
      } else {
        // Such an error shouldn't occur and must be tracked via telemetry
        // The message will anyway remain in the store to be updated again
      }
    });
    store.dispatch(removeMessages(migrationResult.succeeded));
    return migrationResult;
  });

  // TODO: dispatch to remove the loader
}
