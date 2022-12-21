import { render } from "@testing-library/react-native";
import React from "react";

import I18n from "../../../i18n";
import {
  service_1,
  service_2,
  successReloadMessagesPayload
} from "../../../__mocks__/messages";
import MessagesSearch from "../MessagesSearch";

const messages = successReloadMessagesPayload.messages;

describe("MessagesSearch component", () => {
  describe("when there are no messages", () => {
    it("should only render the default view", () => {
      const renderFn = jest.fn();
      const { queryByText } = render(
        <MessagesSearch
          messages={[]}
          searchText={"nothing"}
          renderSearchResults={renderFn}
        />
      );
      expect(queryByText(I18n.t("global.search.noResultsFound"))).toBeDefined();
      expect(renderFn).not.toHaveBeenCalled();
    });
  });

  describe("when there are no matching messages", () => {
    it("should only render the default view", () => {
      const renderFn = jest.fn();
      const { queryByText } = render(
        <MessagesSearch
          messages={messages}
          searchText={"nothing"}
          renderSearchResults={renderFn}
        />
      );
      expect(queryByText(I18n.t("global.search.noResultsFound"))).toBeDefined();
      expect(renderFn).not.toHaveBeenCalled();
    });
  });

  describe("when there is at least one matching message", () => {
    it("should match the messages title", () => {
      const renderFn = jest.fn();
      const { queryByText } = render(
        <MessagesSearch
          messages={messages}
          searchText={"Analiżi tad-demm"}
          renderSearchResults={renderFn}
        />
      );
      expect(queryByText(I18n.t("global.search.noResultsFound"))).toBeNull();
      expect(renderFn).toHaveBeenNthCalledWith(1, [messages[1]]);
    });

    it("should match the service name", () => {
      const renderFn = jest.fn();
      const { queryByText } = render(
        <MessagesSearch
          messages={messages}
          searchText={service_1.service_name}
          renderSearchResults={renderFn}
        />
      );
      expect(queryByText(I18n.t("global.search.noResultsFound"))).toBeNull();
      expect(renderFn).toHaveBeenNthCalledWith(1, [messages[0], messages[1]]);
    });

    it("should match the organization name", () => {
      const renderFn = jest.fn();
      const { queryByText } = render(
        <MessagesSearch
          messages={messages}
          searchText={service_2.organization_name}
          renderSearchResults={renderFn}
        />
      );
      expect(queryByText(I18n.t("global.search.noResultsFound"))).toBeNull();
      expect(renderFn).toHaveBeenNthCalledWith(1, [messages[2]]);
    });
  });
});
