import * as pot from "@pagopa/ts-commons/lib/pot";
import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { SagaIterator } from "redux-saga";
import {
  put,
  select,
  takeEvery,
  takeLatest,
  call
} from "typed-redux-saga/macro";
import { ActionType, getType } from "typesafe-actions";
import { BackendClient } from "../../api/backend";
import { loadThirdPartyMessage } from "../../features/messages/store/actions";
import { toPNMessage } from "../../features/pn/store/types/transformers";
import { getPaginatedMessageById } from "../../store/reducers/entities/messages/paginatedById";
import { getError } from "../../utils/errors";
import {
  trackPNNotificationLoadError,
  trackPNNotificationLoadSuccess
} from "../../features/pn/analytics";
import { trackThirdPartyMessageAttachmentCount } from "../../features/messages/analytics";
import { withRefreshApiCall } from "../../features/fastLogin/saga/utils";
import { SagaCallReturnType } from "../../types/utils";

function* getThirdPartyMessage(
  client: BackendClient,
  action: ActionType<typeof loadThirdPartyMessage.request>
) {
  const id = action.payload;
  const getThirdPartyMessage = client.getThirdPartyMessage();

  try {
    const result = (yield* call(
      withRefreshApiCall,
      getThirdPartyMessage({ id }),
      action
    )) as unknown as SagaCallReturnType<typeof getThirdPartyMessage>;
    if (E.isLeft(result)) {
      yield* put(
        loadThirdPartyMessage.failure({
          id,
          error: new Error(readableReport(result.left))
        })
      );
    } else if (result.right.status === 200) {
      yield* put(
        loadThirdPartyMessage.success({ id, content: result.right.value })
      );
    } else {
      yield* put(
        loadThirdPartyMessage.failure({
          id,
          error: new Error(`response status ${result.right.status}`)
        })
      );
    }
  } catch (e) {
    yield* put(loadThirdPartyMessage.failure({ id, error: getError(e) }));
  }
}

function* trackSuccess(
  action: ActionType<typeof loadThirdPartyMessage.success>
) {
  const messageFromApi = action.payload.content;
  const messageId = messageFromApi.id;

  const message = pot.toUndefined(
    yield* select(getPaginatedMessageById, messageId)
  );

  if (message?.category.tag === "PN") {
    const pnMessageOption = toPNMessage(messageFromApi);

    if (O.isSome(pnMessageOption)) {
      const pnMessage = pnMessageOption.value;
      trackPNNotificationLoadSuccess(pnMessage);
    } else {
      trackPNNotificationLoadError();
    }
  } else {
    const attachments = messageFromApi.third_party_message.attachments;
    const attachmentCount = attachments?.length ?? 0;
    trackThirdPartyMessageAttachmentCount(attachmentCount);
  }
}

function* trackFailure(
  action: ActionType<typeof loadThirdPartyMessage.failure>
) {
  const messageId = action.payload.id;
  const message = pot.toUndefined(
    yield* select(getPaginatedMessageById, messageId)
  );

  if (message?.category.tag === "PN") {
    const errorCode = action.payload.error.message;
    trackPNNotificationLoadError(errorCode);
  }
}

export function* watchThirdPartyMessageSaga(
  client: BackendClient
): SagaIterator {
  yield* takeLatest(
    getType(loadThirdPartyMessage.request),
    getThirdPartyMessage,
    client
  );

  yield* takeEvery(getType(loadThirdPartyMessage.success), trackSuccess);
  yield* takeEvery(getType(loadThirdPartyMessage.failure), trackFailure);
}
