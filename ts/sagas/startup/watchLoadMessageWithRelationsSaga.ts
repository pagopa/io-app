import { TypeofApiCall } from "italia-ts-commons/lib/requests";
import { Effect } from "redux-saga";
import { call, put, takeEvery } from "redux-saga/effects";

import {
  GetServiceT,
  GetUserMessageT
} from "../../../definitions/backend/requestTypes";
import I18n from "../../i18n";
import { MESSAGE_WITH_RELATIONS_LOAD_REQUEST } from "../../store/actions/constants";
import {
  loadMessageWithRelationsFailureAction,
  loadMessageWithRelationsSuccessAction,
  MessageWithRelationsLoadRequest
} from "../../store/actions/messages";
import { SagaCallReturnType } from "../../types/utils";
import { loadMessage, loadService } from "./watchLoadMessagesSaga";

/**
 * Load message with related entities (ex. the sender service).
 */
export function* loadMessageWithRelationsSaga(
  getMessage: TypeofApiCall<GetUserMessageT>,
  getService: TypeofApiCall<GetServiceT>,
  messageWithRelationsLoadRequest: MessageWithRelationsLoadRequest
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
    // We have the message try to load also the sender service
    const serviceOrError = yield call(
      loadService,
      getService,
      message.sender_service_id
    );

    if (serviceOrError.isRight()) {
      yield put(loadMessageWithRelationsSuccessAction());

      return;
    }
  }

  yield put(
    loadMessageWithRelationsFailureAction(
      new Error(I18n.t("global.actions.retry"))
    )
  );
}

/**
 * A saga that waits for MESSAGE_WITH_RELATIONS_LOAD_REQUEST action and call loadMessageWithRelationsSaga.
 */
export function* watchLoadMessageWithRelationsSaga(
  getMessage: TypeofApiCall<GetUserMessageT>,
  getService: TypeofApiCall<GetServiceT>
) {
  yield takeEvery(
    MESSAGE_WITH_RELATIONS_LOAD_REQUEST,
    loadMessageWithRelationsSaga,
    getMessage,
    getService
  );
}
