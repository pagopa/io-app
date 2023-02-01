import * as pot from "@pagopa/ts-commons/lib/pot";
import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { SagaIterator } from "redux-saga";
import {
  call,
  put,
  select,
  takeEvery,
  takeLatest
} from "typed-redux-saga/macro";
import { ActionType, getType } from "typesafe-actions";
import { BackendClient } from "../../api/backend";
import { loadThirdPartyMessage } from "../../features/messages/store/actions";
import { toPNMessage } from "../../features/pn/store/types/transformers";
import { mixpanelTrack } from "../../mixpanel";
import { getMessageById } from "../../store/reducers/entities/messages/paginatedById";
import { trackThirdPartyMessageAttachmentCount } from "../../utils/analytics";
import { getError } from "../../utils/errors";

function* getThirdPartyMessage(
  client: ReturnType<typeof BackendClient>,
  action: ActionType<typeof loadThirdPartyMessage.request>
) {
  const id = action.payload;
  try {
    const result = yield* call(client.getThirdPartyMessage, { id });
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

  const message = pot.toUndefined(yield* select(getMessageById, messageId));

  if (message?.category.tag === "PN") {
    const pnMessageOption = toPNMessage(messageFromApi);

    if (O.isSome(pnMessageOption)) {
      const pnMessage = pnMessageOption.value;
      void mixpanelTrack("PN_NOTIFICATION_LOAD_SUCCESS", {
        notificationLastStatus:
          pnMessage.notificationStatusHistory[
            pnMessage.notificationStatusHistory.length - 1
          ].status,
        hasAttachments: (pnMessage.attachments?.length ?? 0) > 0
      });
    } else {
      void mixpanelTrack("PN_NOTIFICATION_LOAD_ERROR", {
        jsonDecodeFailed: true
      });
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
  const errorCode = action.payload.error.message;

  const message = pot.toUndefined(yield* select(getMessageById, messageId));

  if (message?.category.tag === "PN") {
    void mixpanelTrack("PN_NOTIFICATION_LOAD_ERROR", {
      errorCode
    });
  }
}

export function* watchThirdPartyMessageSaga(
  client: ReturnType<typeof BackendClient>
): SagaIterator {
  yield* takeLatest(
    getType(loadThirdPartyMessage.request),
    getThirdPartyMessage,
    client
  );

  yield* takeEvery(getType(loadThirdPartyMessage.success), trackSuccess);
  yield* takeEvery(getType(loadThirdPartyMessage.failure), trackFailure);
}
