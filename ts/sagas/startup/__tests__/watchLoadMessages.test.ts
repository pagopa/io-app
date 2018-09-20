import { left, right } from "fp-ts/lib/Either";
import { testSaga } from "redux-saga-test-plan";
import { call } from "redux-saga/effects";

import { CreatedMessageWithContent } from "../../../../definitions/backend/CreatedMessageWithContent";
import { ServicePublic } from "../../../../definitions/backend/ServicePublic";
import {
  loadMessageFailure,
  loadMessagesFailure,
  loadMessagesSuccess,
  loadMessageSuccess
} from "../../../store/actions/messages";
import {
  loadServiceFailure,
  loadServiceSuccess
} from "../../../store/actions/services";
import { messagesByIdSelector } from "../../../store/reducers/entities/messages/messagesById";
import { servicesByIdSelector } from "../../../store/reducers/entities/services/servicesById";
import { toMessageWithContentPO } from "../../../types/MessageWithContentPO";
import {
  loadMessage,
  loadMessages,
  loadService
} from "../../startup/watchLoadMessagesSaga";

const testMessageId1 = "01BX9NSMKAAAS5PSP2FATZM6BQ";
const testMessageId2 = "01CD4QN3Q2KS2T791PPMT2H9DM";
const testServiceId1 = "5a563817fcc896087002ea46c49a";

const testMessageWithContent1 = {
  id: testMessageId1,
  created_at: new Date(),
  content: {
    markdown:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin eget fringilla neque, laoreet volutpat elit. Nunc leo nisi, dignissim eget lobortis non, faucibus in augue.",
    subject: "Lorem ipsum..."
  },
  sender_service_id: testServiceId1
} as CreatedMessageWithContent;

const testMessageWithContent2 = {
  id: testMessageId2,
  created_at: new Date(),
  content: {
    markdown:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin eget fringilla neque, laoreet volutpat elit. Nunc leo nisi, dignissim eget lobortis non, faucibus in augue.",
    subject: "Lorem ipsum..."
  },
  sender_service_id: testServiceId1
} as CreatedMessageWithContent;

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
      testSaga(loadMessage, getMessage, testMessageId1)
        .next()
        .next()
        .call(getMessage, { id: testMessageId1 });
    });

    it("should only return an empty error if the getMessage response is undefined (can't be decoded)", () => {
      const getMessage = jest.fn();
      testSaga(loadMessage, getMessage, testMessageId1)
        .next()
        .next()
        // Return undefined as getMessage response
        .next(undefined)
        .put(loadMessageFailure(Error()))
        .next()
        .returns(left(Error()));
    });

    it("should only return the error if the getMessage response status is not 200", () => {
      const getMessage = jest.fn();
      const error = Error("Backend error");
      testSaga(loadMessage, getMessage, testMessageId1)
        .next()
        .next()
        // Return 500 with an error message as getMessage response
        .next({ status: 500, value: error })
        .put(loadMessageFailure(error))
        .next()
        .returns(left(error));
    });

    it("should put MESSAGE_LOAD_SUCCESS and return the message if the getMessage response status is 200", () => {
      const getMessage = jest.fn();
      testSaga(loadMessage, getMessage, testMessageId1)
        .next()
        .next()
        // Return 200 with a valid message as getMessage response
        .next({ status: 200, value: testMessageWithContent1 })
        .put(
          loadMessageSuccess(toMessageWithContentPO(testMessageWithContent1))
        )
        .next()
        .returns(right(toMessageWithContentPO(testMessageWithContent1)));
    });
  });

  describe("loadService test plan", () => {
    it("should call getService with the right parameters", () => {
      const getService = jest.fn();
      testSaga(loadService, getService, testServiceId1)
        .next()
        .next()
        .call(getService, { id: testServiceId1 });
    });

    it("should only return an empty error if the getService response is undefined (can't be decoded)", () => {
      const getService = jest.fn();
      testSaga(loadService, getService, testServiceId1)
        .next()
        .next()
        // Return undefined as getService response
        .next(undefined)
        .put(loadServiceFailure(Error()))
        .next()
        .returns(left(Error()));
    });

    it("should only return the error if the getService response status is not 200", () => {
      const getService = jest.fn();
      const error = Error("Backend error");
      testSaga(loadService, getService, testServiceId1)
        .next()
        .next()
        // Return 500 with an error message as getService response
        .next({ status: 500, value: Error("Backend error") })
        .put(loadServiceFailure(error))
        .next()
        .returns(left(Error("Backend error")));
    });

    it("should put SERVICE_LOAD_SUCCESS and return the service if the getService response status is 200", () => {
      const getService = jest.fn();
      testSaga(loadService, getService, testServiceId1)
        .next()
        .next()
        // Return 200 with a valid service as getService response
        .next({ status: 200, value: testServicePublic })
        .put(loadServiceSuccess(testServicePublic))
        .next()
        .returns(right(testServicePublic));
    });
  });

  describe("loadMessages test plan", () => {
    it("should put MESSAGES_LOAD_FAILURE with the Error it the getMessages response is an Error", () => {
      const getMessages = jest.fn();
      const getMessage = jest.fn();
      const getService = jest.fn();
      testSaga(loadMessages, getMessages, getMessage, getService)
        .next()
        .select(messagesByIdSelector)
        // Return an empty object as messagesByIdSelectors response
        .next({})
        .select(servicesByIdSelector)
        // Return an empty object as servicesByIdSelector response
        .next({})
        .call(getMessages, {})
        // Return an error message as getMessages response
        .next({ status: 500, value: Error("Backend error") })
        .put(loadMessagesFailure(Error("Backend error")))
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
        .select(messagesByIdSelector)
        // Return an empty object as messagesByIdSelectors response (no message already stored)
        .next({})
        .select(servicesByIdSelector)
        // Return an empty object as servicesByIdSelector response (no service already stored)
        .next({})
        .call(getMessages, {})
        // Return 200 with a list of 2 messages as getMessages response
        .next({ status: 200, value: testMessages })
        .all([call(loadService, getService, "5a563817fcc896087002ea46c49a")])
        .next({ status: 200, value: testServicePublic })
        .all([
          call(loadMessage, getMessage, testMessageId1),
          call(loadMessage, getMessage, testMessageId2)
        ])
        .next()
        .put(loadMessagesSuccess());
    });

    it("should not call getService and getMessage if the getMessages response contains 0 new services and 0 new messages", () => {
      const getMessages = jest.fn();
      const getMessage = jest.fn();
      const getService = jest.fn();
      testSaga(loadMessages, getMessages, getMessage, getService)
        .next()
        .select(messagesByIdSelector)
        // Return an object as messagesByIdSelectors response
        .next({
          [testMessageId1]: testMessageWithContent1,
          [testMessageId2]: testMessageWithContent2
        })
        .select(servicesByIdSelector)
        // Return an object as servicesByIdSelector response
        .next({
          testServiceId1: testServicePublic
        })
        .call(getMessages, {})
        // Return 200 with a list of 2 messages as getMessages response
        .next({ status: 200, value: testMessages })
        .all([])
        .next()
        .all([])
        .next()
        .put(loadMessagesSuccess());
    });
  });
});
