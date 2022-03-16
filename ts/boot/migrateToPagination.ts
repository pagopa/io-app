import * as TE from "fp-ts/lib/TaskEither";
import * as Either from "fp-ts/lib/Either";

import {
  messagesStatusSelector,
  MessageStatus
} from "../store/reducers/entities/messages/messagesStatus";
import { removeMessages } from "../store/actions/messages";
import { Store } from "../store/actions/types";

export default function init(
  store: Store,
  upsert: (id: string, messageStatus: MessageStatus) => Promise<void>
): TE.TaskEither<Array<string>, void> {
  const data = messagesStatusSelector(store.getState());
  const allIds = Object.keys(data);
  if (allIds.length < 1) {
    return TE.fromEither(Either.right(undefined));
  }
  // TODO: dispatch to show the loader
  return Promise.allSettled(
    allIds.map(id => {
      const messageStatus = data[id];
      if (messageStatus) {
        return TE.tryCatch(
          () =>
            upsert(id, messageStatus).then(() =>
              store.dispatch(removeMessages([id]))
            ),
          reason => ({
            error: reason,
            messageId: id
          })
        );
      } else {
        store.dispatch(removeMessages([id]));
        return Promise.resolve();
      }
    })
  );
  // TODO: dispatch to remove the loader
}
