import * as pot from "italia-ts-commons/lib/pot";
import { call, Effect, put, select } from "redux-saga/effects";
import { ActionType } from "typesafe-actions";
import { BackendClient } from "../../api/backend";
import { loadMessageWithRelations } from "../../store/actions/messages";
import { loadServiceDetail } from "../../store/actions/services";
import { serviceByIdSelector } from "../../store/reducers/entities/services/servicesById";
import { SagaCallReturnType } from "../../types/utils";
import { loadMessage } from "../messages/messages";

/**
 * Load message with related entities (ex. the sender service).
 */
export function* loadMessageWithRelationsSaga(
  getMessage: ReturnType<typeof BackendClient>["getMessage"],
  messageWithRelationsLoadRequest: ActionType<
    typeof loadMessageWithRelations["request"]
  >
): Generator<Effect, void, any> {
  // Extract the message id from the action payload
  const messageId = messageWithRelationsLoadRequest.payload;

  try {
    const messageOrError: SagaCallReturnType<typeof loadMessage> = yield call(
      loadMessage,
      getMessage,
      messageId
    );

    if (messageOrError.isLeft()) {
      throw new Error(messageOrError.value.message);
    }

    const message = messageOrError.value;
    yield put(loadMessageWithRelations.success());

    const serviceById = serviceByIdSelector(message.sender_service_id);

    const potService: ReturnType<typeof serviceById> = yield select(
      serviceById
    );

    // We have the message try to load also the sender service only if there's
    // no such service or if we are already loading it
    if (
      potService === undefined ||
      (!pot.isSome(potService) && !pot.isLoading(potService))
    ) {
      yield put(loadServiceDetail.request(message.sender_service_id));
    }
  } catch (e) {
    yield put(loadMessageWithRelations.failure(e));
  }
}
