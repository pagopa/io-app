import React from "react";
import { Text } from "react-native";
import configureMockStore from "redux-mock-store";
import I18n from "../../../i18n";
import ROUTES from "../../../navigation/routes";
import { applicationChangeState } from "../../../store/actions/application";
import { appReducer } from "../../../store/reducers";
import { GlobalState } from "../../../store/reducers/types";
import { renderScreenFakeNavRedux } from "../../../utils/testWrapper";
import { successReloadMessagesPayload } from "../../../__mocks__/messages";
import PaginatedMessageList from "../PaginatedMessageList";

const messages = successReloadMessagesPayload.messages;

const ListEmptyComponent = () => <Text>{"empty"}</Text>;

describe("MessageList component", () => {
  describe("when messages aren't loaded yet", () => {
    it("should not render the empty component", () => {
      const { component } = renderComponent({
        ListEmptyComponent,
        messages: [],
        isSome: false
      });
      expect(component.queryByText("empty")).toBeNull();
    });
  });

  describe("when there are no messages", () => {
    it("should render the empty component", () => {
      const { component } = renderComponent({
        ListEmptyComponent,
        messages: [],
        isSome: true
      });
      expect(component.getByText("empty")).toBeDefined();
    });
  });

  describe("when the messages state contains an error", () => {
    it("should render the error component", () => {
      const { component } = renderComponent({
        ListEmptyComponent,
        messages: [],
        isError: true
      });
      expect(
        component.getByText(I18n.t("messages.loadingErrorTitle"))
      ).toBeDefined();
    });
  });

  describe("when the messages state contains messages", () => {
    // eslint-disable-next-line sonarjs/no-identical-functions
    it("should not render the empty component", () => {
      const { component } = renderComponent({
        ListEmptyComponent,
        messages,
        isSome: true
      });
      expect(component.queryByText("empty")).toBeNull();
    });

    it("should not render the error component", () => {
      const { component } = renderComponent({
        ListEmptyComponent,
        messages,
        isSome: true
      });
      expect(
        component.queryByText(I18n.t("messages.loadingErrorTitle"))
      ).toBeNull();
    });

    it("should render the first message in the state", () => {
      const { component } = renderComponent({
        ListEmptyComponent,
        messages,
        isSome: true
      });
      expect(component.queryByText(messages[0].title)).toBeDefined();
    });
  });
});

const renderComponent = (
  props: React.ComponentProps<typeof PaginatedMessageList>
) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(globalState);

  return {
    component: renderScreenFakeNavRedux<GlobalState>(
      () => <PaginatedMessageList {...props} />,
      ROUTES.MESSAGES_HOME,
      {},
      store
    ),
    store
  };
};
