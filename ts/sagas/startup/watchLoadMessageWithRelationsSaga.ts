import { TypeofApiCall } from "italia-ts-commons/lib/requests";
import { Effect } from "redux-saga";
import { call, put, select } from "redux-saga/effects";
import { ActionType } from "typesafe-actions";

import { GetUserMessageT } from "../../../definitions/backend/requestTypes";
import I18n from "../../i18n";
import {
  loadMessageWithRelationsAction,
  loadMessageWithRelationsFailureAction,
  loadMessageWithRelationsSuccessAction
} from "../../store/actions/messages";
import { loadServiceRequest } from "../../store/actions/services";
import { serviceByIdSelector } from "../../store/reducers/entities/services/servicesById";
import { GlobalState } from "../../store/reducers/types";
import * as pot from "../../types/pot";
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
  // Extract the message id from the action payload
  const messageId = messageWithRelationsLoadRequest.payload;

  const messageOrError: SagaCallReturnType<typeof loadMessage> = yield call(
    loadMessage,
    getMessage,
    messageId
  );

  if (messageOrError.isLeft()) {
    yield put(
      loadMessageWithRelationsFailureAction(
        new Error(I18n.t("global.actions.retry"))
      )
    );
    return;
  }

  const message = messageOrError.value;
  yield put(loadMessageWithRelationsSuccessAction());

  const serviceById = serviceByIdSelector(message.sender_service_id);

  const potService: ReturnType<typeof serviceById> = yield select<GlobalState>(
    serviceById
  );

  // We have the message try to load also the sender service only if there's
  // no such service or if we are already loading it
  if (
    potService === undefined ||
    (!pot.isSome(potService) && !pot.isLoading(potService))
  ) {
    yield put(loadServiceRequest(message.sender_service_id));
  }
}
