import { pot } from "@pagopa/ts-commons";
import { fireEvent } from "@testing-library/react-native";
import * as O from "fp-ts/lib/Option";
import React from "react";
import configureMockStore from "redux-mock-store";
import ROUTES from "../../../navigation/routes";
import { applicationChangeState } from "../../../store/actions/application";
import { appReducer } from "../../../store/reducers";
import { AllPaginated } from "../../../store/reducers/entities/messages/allPaginated";
import { GlobalState } from "../../../store/reducers/types";
import { renderScreenFakeNavRedux } from "../../../utils/testWrapper";
import { successReloadMessagesPayload } from "../../../__mocks__/messages";

import MessagesInbox from "../MessagesInbox";

jest.useFakeTimers();

const messages = successReloadMessagesPayload.messages;

describe("MessagesInbox component", () => {
  describe("when there at least one message and the user taps on it", () => {
    it("should call `navigateToMessageDetail` with the message", async () => {
      const props = {
        messages: [],
        navigateToMessageDetail: jest.fn(),
        archiveMessages: jest.fn()
      };
      const { component } = renderComponent(props);
      await fireEvent(component.getByText(messages[0].title), "onPress");
      expect(props.navigateToMessageDetail).toHaveBeenNthCalledWith(
        1,
        messages[0]
      );
    });
  });
});

const renderComponent = (props: React.ComponentProps<typeof MessagesInbox>) => {
  const paginatedState: Partial<AllPaginated> = {
    inbox: { data: pot.some({ page: messages }), lastRequest: O.none }
  };
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const allPaginated = {
    data: pot.none,
    lastRequest: O.none,
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
      () => <MessagesInbox {...props} />,
      ROUTES.MESSAGES_HOME,
      {},
      store
    ),
    store
  };
};
