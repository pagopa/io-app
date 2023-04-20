import { pot } from "@pagopa/ts-commons";
import * as O from "fp-ts/lib/Option";
import React from "react";
import { Text } from "react-native";
import configureMockStore from "redux-mock-store";

import I18n from "../../../i18n";
import ROUTES from "../../../navigation/routes";
import { applicationChangeState } from "../../../store/actions/application";
import { appReducer } from "../../../store/reducers";
import { AllPaginated } from "../../../store/reducers/entities/messages/allPaginated";
import { GlobalState } from "../../../store/reducers/types";
import { renderScreenFakeNavRedux } from "../../../utils/testWrapper";
import {
  defaultRequestPayload,
  successReloadMessagesPayload
} from "../../../__mocks__/messages";
import MessageList from "../MessageList";

jest.useFakeTimers();
jest.mock("../../../utils/showToast", () => ({
  showToast: jest.fn()
}));

const messages = successReloadMessagesPayload.messages;

const ListEmptyComponent = () => <Text>{"empty"}</Text>;
const filter = defaultRequestPayload.filter;

describe("MessagesInbox component", () => {
  describe("when messages aren't loaded yet", () => {
    const messagesState = {
      inbox: { data: pot.noneLoading, lastRequest: O.none },
      archive: { data: pot.noneLoading, lastRequest: O.none }
    };

    it("should not render the empty component", () => {
      const { component } = renderComponent(
        { ListEmptyComponent, filter },
        messagesState
      );
      expect(component.queryByText("empty")).toBeNull();
    });
  });

  describe("when there are no messages", () => {
    it("should render the empty component", () => {
      const { component } = renderComponent({ ListEmptyComponent, filter });
      expect(component.getByText("empty")).toBeDefined();
    });
  });

  describe("when the messages state contains an error", () => {
    it("should render the error component", () => {
      const { component } = renderComponent(
        { ListEmptyComponent, filter },
        { inbox: { data: pot.noneError("paura, eh?"), lastRequest: O.none } }
      );
      expect(
        component.getByText(I18n.t("messages.loadingErrorTitle"))
      ).toBeDefined();
    });
  });

  describe("when the messages state contains messages", () => {
    const messagesState = {
      inbox: { data: pot.some({ page: messages }), lastRequest: O.none }
    };

    // eslint-disable-next-line sonarjs/no-identical-functions
    it("should not render the empty component", () => {
      const { component } = renderComponent(
        { ListEmptyComponent, filter },
        messagesState
      );
      expect(component.queryByText("empty")).toBeNull();
    });

    it("should not render the error component", () => {
      const { component } = renderComponent(
        { ListEmptyComponent, filter },
        messagesState
      );
      expect(
        component.queryByText(I18n.t("messages.loadingErrorTitle"))
      ).toBeNull();
    });

    it("should render the first message in the state", () => {
      const { component } = renderComponent(
        { ListEmptyComponent, filter },
        messagesState
      );
      expect(component.queryByText(messages[0].title)).toBeDefined();
    });
  });
});

const renderComponent = (
  props: React.ComponentProps<typeof MessageList>,
  paginatedState: Partial<AllPaginated> = {}
) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const allPaginated = {
    archive: {
      data: pot.some({
        page: [],
        previous: undefined,
        next: undefined
      }),
      lastRequest: O.none
    },
    inbox: {
      data: pot.some({
        page: [],
        previous: undefined,
        next: undefined
      }),
      lastRequest: O.none
    },
    ...paginatedState
  };

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore({
    ...globalState,
    entities: {
      ...globalState.entities,
      messages: { ...globalState.entities.messages, allPaginated }
    }
  } as GlobalState);

  return {
    component: renderScreenFakeNavRedux<GlobalState>(
      () => <MessageList {...props} />,
      ROUTES.MESSAGES_HOME,
      {},
      store
    ),
    store
  };
};
