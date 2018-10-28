import { TypeofApiCall } from "italia-ts-commons/lib/requests";
import { Effect } from "redux-saga";
import { call, put } from "redux-saga/effects";
import { ActionType } from "typesafe-actions";

import { GetUserMessageT } from "../../../definitions/backend/requestTypes";
import I18n from "../../i18n";
import {
  loadMessageWithRelationsAction,
  loadMessageWithRelationsFailureAction,
  loadMessageWithRelationsSuccessAction
} from "../../store/actions/messages";
import { loadServiceRequest } from "../../store/actions/services";
import { SagaCallReturnType } from "../../types/utils";
import { loadMessage } from "./watchLoadMessagesSaga";

/**
 * Load message with related entities (ex. the sender service).
 */
export function* loadMessageWithRelationsSaga(
  getMessage: TypeofApiCall<GetUserMessageT>,
  messageWithRelationsLoadRequest: ActionType<
    typeof loadMessageWithRelationsAction
  >
): IterableIterator<Effect> {
  // Extract the massage id from the action payload
  const messageId = messageWithRelationsLoadRequest.payload;

  const messageOrError: SagaCallReturnType<typeof loadMessage> = yield call(
    loadMessage,
    getMessage,
    messageId
  );

  if (messageOrError.isRight()) {
    const message = messageOrError.value;
    yield put(loadMessageWithRelationsSuccessAction());

    // We have the message try to load also the sender service
    yield put(loadServiceRequest(message.sender_service_id));

    return;
  }

  yield put(
    loadMessageWithRelationsFailureAction(
      new Error(I18n.t("global.actions.retry"))
    )
  );
}
