import { SagaIterator } from "redux-saga";
import { ActionType, getType } from "typesafe-actions";
import {
  call,
  put,
  select,
  takeEvery,
  takeLatest
} from "typed-redux-saga/macro";
import { readableReport } from "italia-ts-commons/lib/reporters";
import * as pot from "italia-ts-commons/lib/pot";
import { BackendClient } from "../../api/backend";
import { loadThirdPartyMessage } from "../../features/messages/store/actions";
import { getError } from "../../utils/errors";
import { mixpanelTrack } from "../../mixpanel";
import { toPNMessage } from "../../features/pn/store/types/transformers";
import { getMessageById } from "../../store/reducers/entities/messages/paginatedById";

function* getThirdPartyMessage(
  client: ReturnType<typeof BackendClient>,
  action: ActionType<typeof loadThirdPartyMessage.request>
) {
  const id = action.payload;
  try {
    const result = yield* call(client.getThirdPartyMessage, { id });
    if (result.isLeft()) {
      yield* put(
        loadThirdPartyMessage.failure({
          id,
          error: new Error(readableReport(result.value))
        })
      );
    } else if (result.value.status === 200) {
      yield* put(
        loadThirdPartyMessage.success({ id, content: result.value.value })
      );
    } else {
      yield* put(
        loadThirdPartyMessage.failure({
          id,
          error: new Error(`response status ${result.value.status}`)
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
    const pnMessage = toPNMessage(messageFromApi);

    if (pnMessage === undefined) {
      mixpanelTrack("PN_NOTIFICATION_LOAD_ERROR", {
        jsonDecodeFailed: true
      });
    } else {
      mixpanelTrack("PN_NOTIFICATION_LOAD_SUCCESS", {
        notificationLastStatus:
          pnMessage.notificationStatusHistory[
            pnMessage.notificationStatusHistory.length - 1
          ].status,
        hasAttachments: (pnMessage.attachments?.length ?? 0) > 0
      });
    }
  }
}

function* trackFailure(
  action: ActionType<typeof loadThirdPartyMessage.failure>
) {
  const messageId = action.payload.id;
  const errorCode = action.payload.error.message;

  const message = pot.toUndefined(yield* select(getMessageById, messageId));

  if (message?.category.tag === "PN") {
    mixpanelTrack("PN_NOTIFICATION_LOAD_ERROR", {
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
