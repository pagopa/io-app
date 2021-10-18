import { right } from "fp-ts/lib/Either";
import * as pot from "italia-ts-commons/lib/pot";
import { testSaga } from "redux-saga-test-plan";
import { put } from "redux-saga/effects";

import {
  loadMessage as loadMessageAction,
  loadMessages as loadMessagesAction
} from "../../../store/actions/messages";
import { loadServiceDetail } from "../../../store/actions/services";
import { messagesAllIdsSelector } from "../../../store/reducers/entities/messages/messagesAllIds";
import { messagesStateByIdSelector } from "../../../store/reducers/entities/messages/messagesById";
import { messagesStatusSelector } from "../../../store/reducers/entities/messages/messagesStatus";
import { servicesByIdSelector } from "../../../store/reducers/entities/services/servicesById";

import { testLoadMessages } from "../watchLoadMessagesSaga";
import {
  apiPayload,
  messageId_1,
  messageId_2,
  messageId_3,
  serviceId_1,
  serviceId_2,
  successPayload
} from "../../../__mocks__/messages";

const loadMessages = testLoadMessages!;

describe("loadMessages test plan", () => {
  const defaultParameters = { enrich_result_data: true };

  it("should call `getMessages` with the default parameters parameter `enrich_result_data`", () => {
    const getMessages = jest.fn();
    testSaga(loadMessages, getMessages)
      .next()
      .call(getMessages, defaultParameters);
  });

  describe("when `getMessages` call returns an error", () => {
    it("should put MESSAGES_LOAD_FAILURE with the error message", () => {
      const getMessages = jest.fn();
      testSaga(loadMessages, getMessages)
        .next()
        .call(getMessages, defaultParameters)
        .next(right({ status: 500, value: { title: "Backend error" } }))
        .put(loadMessagesAction.failure(Error("Backend error")))
        .next()
        .next()
        .isDone();
    });
  });

  describe("when `getMessages` call returns 3 messages from 2 services", () => {
    it("should call the `loadServiceDetail` saga 2 times and `getMessage` 3 times", () => {
      const getMessages = jest.fn();
      testSaga(loadMessages, getMessages)
        .next()
        .call(getMessages, defaultParameters)
        .next(right({ status: 200, value: apiPayload }))
        .put(loadMessagesAction.success(successPayload))
        .next()
        .select(messagesAllIdsSelector)
        .next(pot.some([]))
        .select(messagesStatusSelector)
        .next({})
        .select(messagesStateByIdSelector)
        .next({})
        .select(servicesByIdSelector)
        .next({})
        .all([
          put(loadServiceDetail.request(serviceId_2)),
          put(loadServiceDetail.request(serviceId_1))
        ])
        .next()
        .all([
          put(loadMessageAction.request(messageId_3)),
          put(loadMessageAction.request(messageId_2)),
          put(loadMessageAction.request(messageId_1))
        ]);
    });

    describe("and two messages are already cached", () => {
      it("should call `getMessage` and `loadServiceDetail` only once for the missing message and service", () => {
        const getMessages = jest.fn();
        testSaga(loadMessages, getMessages)
          .next()
          .call(getMessages, defaultParameters)
          .next(right({ status: 200, value: apiPayload }))
          .put(loadMessagesAction.success(successPayload))
          .next()
          .select(messagesAllIdsSelector)
          .next(pot.some([]))
          .select(messagesStatusSelector)
          .next({})
          .select(messagesStateByIdSelector)
          // Return an object as messagesByIdSelectors response with the first two messages
          .next({
            [messageId_1]: {
              message: pot.some(successPayload.messages[0]) as any
            },
            [messageId_2]: {
              message: pot.some(successPayload.messages[1]) as any
            }
          } as ReturnType<typeof messagesStateByIdSelector>)
          .select(servicesByIdSelector)
          .next({})
          .all([put(loadServiceDetail.request(serviceId_2))])
          .next()
          .all([put(loadMessageAction.request(messageId_3))]);
      });
    });
  });
});
