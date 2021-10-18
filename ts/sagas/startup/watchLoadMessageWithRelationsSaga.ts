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
 * Load a message given its ID. If the sender service is not present on the client,
 * fetch it immediately as well.
 *
 * @param getMessage API call to fetch the message detail
 * @param messageWithRelationsLoadRequest
 */
export function* watchLoadMessageWithRelationsSaga(
  getMessage: ReturnType<typeof BackendClient>["getMessage"],
  messageWithRelationsLoadRequest: ActionType<
    typeof loadMessageWithRelations["request"]
  >
): Generator<Effect, void, any> {
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
    yield put(loadMessageWithRelations.success(message));

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
