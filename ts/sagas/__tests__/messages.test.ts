import { call, select } from "redux-saga/effects";

import { BackendClient } from "../../api/backend";
import { apiUrlPrefix } from "../../config";
import { messagesByIdSelectors } from "../../store/reducers/entities/messages/messagesById";
import { servicesByIdSelector } from "../../store/reducers/entities/services/servicesById";
import { sessionTokenSelector } from "../../store/reducers/session";
import { loadMessage, loadMessages, loadService } from "../messages";

const testId = "01BX9NSMKAAAS5PSP2FATZM6BQ";
const testSessionToken =
  "5b1ce7390b108b8f42009b0aa900eefa6dbdc574edf1b76960625478a32ed1f17d7b79f80c4cd7477ad9a0630d1dbd00";
const backendClient = BackendClient(apiUrlPrefix, testSessionToken);

describe("messages", () => {
  describe("loadMessage", () => {
    const generator = loadMessage(backendClient.getMessage, testId);
    it("should call getMessages with the right parameters", () => {
      expect(generator.next().value).toEqual(
        call(backendClient.getMessage, { id: testId })
      );
    });
  });

  describe("loadService", () => {
    const generator = loadService(backendClient.getService, testId);
    it("should call getService with the right parameters", () => {
      expect(generator.next().value).toEqual(
        call(backendClient.getService, { id: testId })
      );
    });
  });

  describe("loadMessages", () => {
    it("should end immediately if no sessionToken is in the store", () => {
      const generator = loadMessages();

      expect(generator.next().value).toEqual(select(sessionTokenSelector));

      // Pass undefined as sessionToken
      expect(generator.next(undefined).done).toBeTruthy();
    });

    it("should call getMessages if sessionToken is in the store", () => {
      const generator = loadMessages();

      expect(generator.next().value).toEqual(select(sessionTokenSelector));

      // Pass a valid sessionToken to the select
      expect(generator.next(testSessionToken).value).toEqual(
        select(messagesByIdSelectors)
      );

      // Pass an empty object as cachedMessagesById
      expect(generator.next({}).value).toEqual(select(servicesByIdSelector));
    });
  });
});
