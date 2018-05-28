import { testSaga } from "redux-saga-test-plan";
import { call } from "redux-saga/effects";

import { MessageWithContent } from "../../../definitions/backend/MessageWithContent";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import { BackendClient } from "../../api/backend";
import { apiUrlPrefix } from "../../config";
import {
  loadMessagesFailure,
  loadMessagesSuccess,
  loadMessageSuccess
} from "../../store/actions/messages";
import { loadServiceSuccess } from "../../store/actions/services";
import { messagesByIdSelectors } from "../../store/reducers/entities/messages/messagesById";
import { servicesByIdSelector } from "../../store/reducers/entities/services/servicesById";
import { loadMessage, loadMessages, loadService } from "../messages";

const testMessageId1 = "01BX9NSMKAAAS5PSP2FATZM6BQ";
const testMessageId2 = "01CD4QN3Q2KS2T791PPMT2H9DM";
const testServiceId1 = "5a563817fcc896087002ea46c49a";
const testSessionToken =
  "5b1ce7390b108b8f42009b0aa900eefa6dbdc574edf1b76960625478a32ed1f17d7b79f80c4cd7477ad9a0630d1dbd00";
const backendClient = BackendClient(apiUrlPrefix, testSessionToken);
const testMessageWithContent1 = {
  id: testMessageId1,
  created_at: new Date(),
  markdown:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin eget fringilla neque, laoreet volutpat elit. Nunc leo nisi, dignissim eget lobortis non, faucibus in augue.",
  subject: "Lorem ipsum...",
  sender_service_id: testServiceId1
} as MessageWithContent;
const testMessageWithContent2 = {
  id: testMessageId2,
  created_at: new Date(),
  markdown:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin eget fringilla neque, laoreet volutpat elit. Nunc leo nisi, dignissim eget lobortis non, faucibus in augue.",
  subject: "Lorem ipsum...",
  sender_service_id: testServiceId1
} as MessageWithContent;
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
      testSaga(loadMessage, backendClient.getMessage, testMessageId1)
        .next()
        .call(backendClient.getMessage, { id: testMessageId1 });
    });

    it("should only return an empty error if the getMessage response is undefined (can't be decoded)", () => {
      testSaga(loadMessage, backendClient.getMessage, testMessageId1)
        .next()
        // Return undefined as getMessage response
        .next(undefined)
        .returns(Error());
    });

    it("should only return the error if the getMessage response status is not 200", () => {
      testSaga(loadMessage, backendClient.getMessage, testMessageId1)
        .next()
        // Return 500 with an error message as getMessage response
        .next({ status: 500, value: Error("Backend error") })
        .returns(Error("Backend error"));
    });

    it("should put MESSAGE_LOAD_SUCCESS and return the message if the getMessage response status is 200", () => {
      testSaga(loadMessage, backendClient.getMessage, testMessageId1)
        .next()
        // Return 200 with a valid message as getMessage response
        .next({ status: 200, value: testMessageWithContent1 })
        .put(loadMessageSuccess(testMessageWithContent1))
        .next()
        .returns(testMessageWithContent1);
    });
  });

  describe("loadService test plan", () => {
    it("should call getService with the right parameters", () => {
      testSaga(loadService, backendClient.getService, testServiceId1)
        .next()
        .call(backendClient.getService, { id: testServiceId1 });
    });

    it("should only return an empty error if the getService response is undefined (can't be decoded)", () => {
      testSaga(loadService, backendClient.getService, testServiceId1)
        .next()
        // Return undefined as getService response
        .next(undefined)
        .returns(Error());
    });

    it("should only return the error if the getService response status is not 200", () => {
      testSaga(loadService, backendClient.getService, testServiceId1)
        .next()
        // Return 500 with an error message as getService response
        .next({ status: 500, value: Error("Backend error") })
        .returns(Error("Backend error"));
    });

    it("should put SERVICE_LOAD_SUCCESS and return the service if the getService response status is 200", () => {
      testSaga(loadService, backendClient.getService, testServiceId1)
        .next()
        // Return 200 with a valid service as getService response
        .next({ status: 200, value: testServicePublic })
        .put(loadServiceSuccess(testServicePublic))
        .next()
        .returns(testServicePublic);
    });
  });

  describe("loadMessages test plan", () => {
    it("should put MESSAGES_LOAD_FAILURE with empty error it the getMessages response is undefined (can't be decoded)", () => {
      testSaga(loadMessages, backendClient)
        .next()
        .select(messagesByIdSelectors)
        // Return an empty object as messagesByIdSelectors response
        .next({})
        .select(servicesByIdSelector)
        // Return an empty object as servicesByIdSelector response
        .next({})
        .call(backendClient.getMessages, {})
        // Return undefined as getMessages response
        .next(undefined)
        .put(loadMessagesFailure(Error()))
        .next()
        .next()
        .isDone();
    });

    it("should put MESSAGES_LOAD_FAILURE with the error it the getMessages response status is not 200", () => {
      testSaga(loadMessages, backendClient)
        .next()
        .select(messagesByIdSelectors)
        // Return an empty object as messagesByIdSelectors response
        .next({})
        .select(servicesByIdSelector)
        // Return an empty object as servicesByIdSelector response
        .next({})
        .call(backendClient.getMessages, {})
        // Return 500 with an error message as getMessages response
        .next({ status: 500, value: Error("Backend error") })
        .put(loadMessagesFailure(Error("Backend error")))
        .next()
        .next()
        .isDone();
    });

    it("should call the getService saga N times and getMessage M times if the getMessages response contains N new services and M new messages", () => {
      testSaga(loadMessages, backendClient)
        .next()
        .select(messagesByIdSelectors)
        // Return an empty object as messagesByIdSelectors response (no message already stored)
        .next({})
        .select(servicesByIdSelector)
        // Return an empty object as servicesByIdSelector response (no service already stored)
        .next({})
        .call(backendClient.getMessages, {})
        // Return 200 with a list of 2 messages as getMessages response
        .next({ status: 200, value: testMessages })
        .all([
          call(
            loadService,
            backendClient.getService,
            "5a563817fcc896087002ea46c49a"
          )
        ])
        .next({ status: 200, value: testServicePublic })
        .all([
          call(loadMessage, backendClient.getMessage, testMessageId1),
          call(loadMessage, backendClient.getMessage, testMessageId2)
        ])
        .next()
        .put(loadMessagesSuccess());
    });

    it("should not call getService and getMessage if the getMessages response contains 0 new services and 0 new messages", () => {
      testSaga(loadMessages, backendClient)
        .next()
        .select(messagesByIdSelectors)
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
        .call(backendClient.getMessages, {})
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
