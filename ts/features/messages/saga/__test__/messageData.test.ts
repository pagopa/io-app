import { testSaga } from "redux-saga-test-plan";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { testable } from "../messageData";
import {
  UIMessage,
  UIMessageId
} from "../../../../store/reducers/entities/messages/types";
import { getPaginatedMessageById } from "../../../../store/reducers/entities/messages/paginatedById";
import { loadMessageById } from "../../../../store/actions/messages";

describe("getPaginatedMessage", () => {
  it("when no paginated message is in store, dispatch a loadMessageById.request and retrieve its result from the store if it succeeds", () => {
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD" as UIMessageId;
    const paginatedMessage = { id: messageId } as UIMessage;
    testSaga(testable!.getPaginatedMessage, messageId)
      .next()
      .select(getPaginatedMessageById, messageId)
      .next(pot.none)
      .put(loadMessageById.request({ id: messageId }))
      .next()
      .take([loadMessageById.success, loadMessageById.failure])
      .next(loadMessageById.success(paginatedMessage))
      .select(getPaginatedMessageById, messageId)
      .next(pot.some(paginatedMessage))
      .returns(paginatedMessage);
  });
  it("when an error is in store, dispatch a loadMessageById.request and retrieve its result from the store if it succeeds", () => {
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD" as UIMessageId;
    const paginatedMessage = { id: messageId } as UIMessage;
    testSaga(testable!.getPaginatedMessage, messageId)
      .next()
      .select(getPaginatedMessageById, messageId)
      .next(pot.noneError)
      .put(loadMessageById.request({ id: messageId }))
      .next()
      .take([loadMessageById.success, loadMessageById.failure])
      .next(loadMessageById.success(paginatedMessage))
      .select(getPaginatedMessageById, messageId)
      .next(pot.some(paginatedMessage))
      .returns(paginatedMessage);
  });
  it("when a paginated message with error is in store, dispatch a loadMessageById.request and retrieve its result from the store if it succeeds", () => {
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD" as UIMessageId;
    const paginatedMessage = { id: messageId } as UIMessage;
    testSaga(testable!.getPaginatedMessage, messageId)
      .next()
      .select(getPaginatedMessageById, messageId)
      .next(pot.someError(paginatedMessage, new Error()))
      .put(loadMessageById.request({ id: messageId }))
      .next()
      .take([loadMessageById.success, loadMessageById.failure])
      .next(loadMessageById.success(paginatedMessage))
      .select(getPaginatedMessageById, messageId)
      .next(pot.some(paginatedMessage))
      .returns(paginatedMessage);
  });
});
