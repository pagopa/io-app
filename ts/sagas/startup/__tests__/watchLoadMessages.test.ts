import { left, right } from "fp-ts/lib/Either";
import * as pot from "italia-ts-commons/lib/pot";
import { testSaga } from "redux-saga-test-plan";
import { call, put } from "redux-saga/effects";

import { CreatedMessageWithContent } from "../../../../definitions/backend/CreatedMessageWithContent";
import { ServicePublic } from "../../../../definitions/backend/ServicePublic";
import {
  loadMessage as loadMessageAction,
  loadMessages as loadMessagesAction
} from "../../../store/actions/messages";
import { loadService } from "../../../store/actions/services";
import {
  messagesStateByIdSelector,
  MessageState
} from "../../../store/reducers/entities/messages/messagesById";
import { servicesByIdSelector } from "../../../store/reducers/entities/services/servicesById";
import { toMessageWithContentPO } from "../../../types/MessageWithContentPO";
import { loadMessage, loadMessages } from "../../startup/watchLoadMessagesSaga";

const testMessageId1 = "01BX9NSMKAAAS5PSP2FATZM6BQ";
const testMessageId2 = "01CD4QN3Q2KS2T791PPMT2H9DM";
const testServiceId1 = "5a563817fcc896087002ea46c49a";

const testMessageWithContent1: CreatedMessageWithContent = {
  id: testMessageId1,
  fiscal_code: "" as any,
  created_at: new Date(),
  content: {
    markdown: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin eget fringilla neque, laoreet volutpat elit. Nunc leo nisi, dignissim eget lobortis non, faucibus in augue." as any,
    subject: "Lorem ipsum..." as any
  },
  sender_service_id: testServiceId1
};

const testMessageMeta1: MessageState = {
  meta: {
    id: testMessageWithContent1.id,
    fiscal_code: testMessageWithContent1.fiscal_code,
    created_at: new Date(),
    sender_service_id: testMessageWithContent1.sender_service_id
  },
  read: false,
  message: pot.some(toMessageWithContentPO(testMessageWithContent1))
};

const testMessageWithContent2: CreatedMessageWithContent = {
  id: testMessageId2,
  fiscal_code: "" as any,
  created_at: new Date(),
  content: {
    markdown: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin eget fringilla neque, laoreet volutpat elit. Nunc leo nisi, dignissim eget lobortis non, faucibus in augue." as any,
    subject: "Lorem ipsum..." as any
  },
  sender_service_id: testServiceId1
};

const testMessageMeta2: MessageState = {
  meta: {
    id: testMessageWithContent2.id,
    fiscal_code: testMessageWithContent2.fiscal_code,
    created_at: new Date(),
    sender_service_id: testMessageWithContent2.sender_service_id
  },
  read: false,
  message: pot.some(toMessageWithContentPO(testMessageWithContent2))
};

const testServicePublic = {
  service_id: testServiceId1,
  service_name: "Service name",
  organization_name: "Organization name",
  department_name: "Department name"
} as ServicePublic;

const testMessages = {
  items: [
    {
      id: testMessageId1,
      sender_service_id: testServiceId1
    },
    {
      id: testMessageId2,
      sender_service_id: testServiceId1
    }
  ],
  page_size: 2
};

describe("messages", () => {
  describe("loadMessage test plan", () => {
    it("should call getMessage with the right parameters", () => {
      const getMessage = jest.fn();
      testSaga(loadMessage, getMessage, { id: testMessageId1 })
        .next()
        .next()
        .put(loadMessageAction.request({ id: testMessageId1 } as any))
        .next()
        .call(getMessage, { id: testMessageId1 });
    });

    it("should only return an empty error if the getMessage response is undefined (can't be decoded)", () => {
      const getMessage = jest.fn();
      testSaga(loadMessage, getMessage, { id: testMessageId1 })
        .next()
        .next()
        .put(loadMessageAction.request({ id: testMessageId1 } as any))
        .next()
        // Return undefined as getMessage response
        .next(undefined)
        .put(
          loadMessageAction.failure({ id: testMessageId1, error: undefined })
        )
        .next()
        .returns(left(Error()));
    });

    it("should only return the error if the getMessage response status is not 200", () => {
      const getMessage = jest.fn();
      const error = Error("Backend error");
      testSaga(loadMessage, getMessage, { id: testMessageId1 })
        .next()
        .next()
        .put(loadMessageAction.request({ id: testMessageId1 } as any))
        .next()
        // Return 500 with an error message as getMessage response
        .next({ status: 500, value: { title: error.message } })
        .put(
          loadMessageAction.failure({
            id: testMessageId1,
            error: error.message
          })
        )
        .next()
        .returns(left(error));
    });

    it("should put MESSAGE_LOAD_SUCCESS and return the message if the getMessage response status is 200", () => {
      const getMessage = jest.fn();
      testSaga(loadMessage, getMessage, { id: testMessageId1 })
        .next()
        .next()
        .put(loadMessageAction.request({ id: testMessageId1 } as any))
        .next()
        // Return 200 with a valid message as getMessage response
        .next({ status: 200, value: testMessageWithContent1 })
        .put(
          loadMessageAction.success(
            toMessageWithContentPO(testMessageWithContent1)
          )
        )
        .next()
        .returns(right(toMessageWithContentPO(testMessageWithContent1)));
    });
  });

  describe("loadMessages test plan", () => {
    it("should put MESSAGES_LOAD_FAILURE with the Error it the getMessages response is an Error", () => {
      const getMessages = jest.fn();
      const getMessage = jest.fn();
      const getService = jest.fn();
      testSaga(loadMessages, getMessages, getMessage, getService)
        .next()
        .select(messagesStateByIdSelector)
        // Return an empty object as messagesByIdSelectors response
        .next({})
        .select(servicesByIdSelector)
        // Return an empty object as servicesByIdSelector response
        .next({})
        .call(getMessages, {})
        // Return an error message as getMessages response
        .next({ status: 500, value: { title: "Backend error" } })
        .put(loadMessagesAction.failure("Backend error"))
        .next()
        .next()
        .isDone();
    });

    it("should call the getService saga N times and getMessage M times if the getMessages response contains N new services and M new messages", () => {
      const getMessages = jest.fn();
      const getMessage = jest.fn();
      const getService = jest.fn();
      testSaga(loadMessages, getMessages, getMessage, getService)
        .next()
        .select(messagesStateByIdSelector)
        // Return an empty object as messagesByIdSelectors response (no message already stored)
        .next({})
        .select(servicesByIdSelector)
        // Return an empty object as servicesByIdSelector response (no service already stored)
        .next({})
        .call(getMessages, {})
        // Return 200 with a list of 2 messages as getMessages response
        .next({ status: 200, value: testMessages })
        .put(loadMessagesAction.success(testMessages.items.map(_ => _.id)))
        .next()
        .all([put(loadService.request("5a563817fcc896087002ea46c49a"))])
        .next({ status: 200, value: testServicePublic })
        .all([
          call(loadMessage, getMessage, testMessages.items[0] as any),
          call(loadMessage, getMessage, testMessages.items[1] as any)
        ]);
    });

    it("should not call getService and getMessage if the getMessages response contains 0 new services and 0 new messages", () => {
      const getMessages = jest.fn();
      const getMessage = jest.fn();
      const getService = jest.fn();
      testSaga(loadMessages, getMessages, getMessage, getService)
        .next()
        .select(messagesStateByIdSelector)
        // Return an object as messagesByIdSelectors response
        .next({
          [testMessageId1]: testMessageMeta1,
          [testMessageId2]: testMessageMeta2
        } as ReturnType<typeof messagesStateByIdSelector>)
        .select(servicesByIdSelector)
        // Return an object as servicesByIdSelector response
        .next({
          [testServiceId1]: pot.some(testServicePublic)
        } as ReturnType<typeof servicesByIdSelector>)
        .call(getMessages, {})
        // Return 200 with a list of 2 messages as getMessages response
        .next({ status: 200, value: testMessages })
        .put(loadMessagesAction.success(testMessages.items.map(_ => _.id)))
        .next()
        // Do not load any new services
        .all([])
        .next()
        // Do not load any new messages
        .all([]);
    });
  });
});
