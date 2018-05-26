import { call, put, select } from "redux-saga/effects";

import { MessageWithContent } from "../../../definitions/backend/MessageWithContent";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import { BackendClient } from "../../api/backend";
import { apiUrlPrefix } from "../../config";
import {
  loadMessagesFailure,
  loadMessageSuccess
} from "../../store/actions/messages";
import { loadServiceSuccess } from "../../store/actions/services";
import { messagesByIdSelectors } from "../../store/reducers/entities/messages/messagesById";
import { servicesByIdSelector } from "../../store/reducers/entities/services/servicesById";
import { loadMessage, loadMessages, loadService } from "../messages";

const testMessageId = "01BX9NSMKAAAS5PSP2FATZM6BQ";
const testServiceId = "5a563817fcc896087002ea46c49a";
const testSessionToken =
  "5b1ce7390b108b8f42009b0aa900eefa6dbdc574edf1b76960625478a32ed1f17d7b79f80c4cd7477ad9a0630d1dbd00";
const backendClient = BackendClient(apiUrlPrefix, testSessionToken);
const testMessageWithContent = {
  id: testMessageId,
  created_at: new Date(),
  markdown:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin eget fringilla neque, laoreet volutpat elit. Nunc leo nisi, dignissim eget lobortis non, faucibus in augue.",
  subject: "Lorem ipsum...",
  sender_service_id: testServiceId
} as MessageWithContent;
const testServicePublic = {
  service_id: testServiceId,
  service_name: "Service name",
  organization_name: "Organization name",
  department_name: "Department name"
} as ServicePublic;

describe("messages", () => {
  describe("loadMessage", () => {
    it("should call getMessage with the right parameters", () => {
      const generator = loadMessage(backendClient.getMessage, testMessageId);
      expect(generator.next().value).toEqual(
        call(backendClient.getMessage, { id: testMessageId })
      );
    });

    it("should end without any put if the getMessage response is undefined (can't be decoded)", () => {
      const generator = loadMessage(backendClient.getMessage, testMessageId);
      expect(generator.next().value).toEqual(
        call(backendClient.getMessage, { id: testMessageId })
      );

      // Pass undefined as getMessage response
      expect(generator.next().done).toBeTruthy();
    });

    it("should end without any put if the getMessage response status is not 200", () => {
      const generator = loadMessage(backendClient.getMessage, testMessageId);
      expect(generator.next().value).toEqual(
        call(backendClient.getMessage, { id: testMessageId })
      );

      // Pass undefined as getMessage response
      expect(
        generator.next({ status: 500, value: Error("500") }).done
      ).toBeTruthy();
    });

    it("should put MESSAGE_LOAD_SUCCESS if the getMessage response status is 200", () => {
      const generator = loadMessage(backendClient.getMessage, testMessageId);
      expect(generator.next().value).toEqual(
        call(backendClient.getMessage, { id: testMessageId })
      );

      // Pass undefined as getMessage response
      expect(
        generator.next({ status: 200, value: testMessageWithContent }).value
      ).toEqual(put(loadMessageSuccess(testMessageWithContent)));

      // End
      expect(generator.next().done).toBeTruthy();
    });
  });

  describe("loadService", () => {
    it("should call getService with the right parameters", () => {
      const generator = loadService(backendClient.getService, testServiceId);
      expect(generator.next().value).toEqual(
        call(backendClient.getService, { id: testServiceId })
      );
    });

    it("should end without any put if the getService response is undefined (can't be decoded)", () => {
      const generator = loadService(backendClient.getService, testServiceId);
      expect(generator.next().value).toEqual(
        call(backendClient.getService, { id: testServiceId })
      );

      // Pass undefined as getMessage response
      expect(generator.next().done).toBeTruthy();
    });

    it("should end without any put if the getService response status is not 200", () => {
      const generator = loadService(backendClient.getService, testServiceId);
      expect(generator.next().value).toEqual(
        call(backendClient.getService, { id: testServiceId })
      );

      // Pass undefined as getService response
      expect(
        generator.next({ status: 500, value: Error("500") }).done
      ).toBeTruthy();
    });

    it("should put SERVICE_LOAD_SUCCESS if the getMessage response status is 200", () => {
      const generator = loadService(backendClient.getService, testServiceId);
      expect(generator.next().value).toEqual(
        call(backendClient.getService, { id: testServiceId })
      );

      // Pass undefined as getService response
      expect(
        generator.next({ status: 200, value: testServicePublic }).value
      ).toEqual(put(loadServiceSuccess(testServicePublic)));

      // End
      expect(generator.next().done).toBeTruthy();
    });
  });

  describe("loadMessages", () => {
    it("should put MESSAGES_LOAD_FAILURE it the getMessages response is undefined (can't be decoded)", () => {
      const generator = loadMessages(backendClient);

      // Should use the messagesByIdSelectors selector
      expect(generator.next().value).toEqual(select(messagesByIdSelectors));

      // Pass an empty object as cachedMessagesById
      // than should use the servicesByIdSelector selector
      expect(generator.next({}).value).toEqual(select(servicesByIdSelector));

      // Pass an empty object as cachedServicesById
      // then should call getMessages
      expect(generator.next({}).value).toEqual(
        call(backendClient.getMessages, {})
      );

      // Pass undefined as getMessages response
      expect(generator.next().value).toEqual(put(loadMessagesFailure(Error())));
    });

    it("should put MESSAGES_LOAD_FAILURE it the getMessages response status is not 200", () => {
      const generator = loadMessages(backendClient);

      // Should use the messagesByIdSelectors selector
      expect(generator.next().value).toEqual(select(messagesByIdSelectors));

      // Pass an empty object as cachedMessagesById
      // than should use the servicesByIdSelector selector
      expect(generator.next({}).value).toEqual(select(servicesByIdSelector));

      // Pass an empty object as cachedServicesById
      // then should call getMessages
      expect(generator.next({}).value).toEqual(
        call(backendClient.getMessages, {})
      );

      // Pass undefined as getMessages response
      expect(
        generator.next({ status: 500, value: Error("500") }).value
      ).toEqual(put(loadMessagesFailure(Error("500"))));
    });
  });
});
