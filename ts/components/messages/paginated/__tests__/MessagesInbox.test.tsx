import React from "react";
import configureMockStore from "redux-mock-store";
import { NavigationParams } from "react-navigation";
import { pot } from "@pagopa/ts-commons";
import { none } from "fp-ts/lib/Option";
import { fireEvent } from "@testing-library/react-native";

import MessagesInbox from "../MessagesInbox";
import { appReducer } from "../../../../store/reducers";
import { applicationChangeState } from "../../../../store/actions/application";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenFakeNavRedux } from "../../../../utils/testWrapper";
import ROUTES from "../../../../navigation/routes";
import { AllPaginated } from "../../../../store/reducers/entities/messages/allPaginated";
import { successReloadMessagesPayload } from "../../../../__mocks__/messages";

jest.useFakeTimers();

const messages = successReloadMessagesPayload.messages;

describe("MessagesInbox component", () => {
  describe("when there at least one message and the user taps on it", () => {
    it("should call `navigateToMessageDetail` with the message", async () => {
      const props = {
        allMessagesIDs: [],
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
    inbox: { data: pot.some({ page: messages }), lastRequest: none }
  };
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const allPaginated = { data: pot.none, lastRequest: none, ...paginatedState };

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore({
    ...globalState,
    entities: {
      ...globalState.entities,
      messages: { ...globalState.entities.messages, allPaginated }
    }
  } as GlobalState);

  return {
    component: renderScreenFakeNavRedux<GlobalState, NavigationParams>(
      () => <MessagesInbox {...props} />,
      ROUTES.MESSAGES_HOME,
      {},
      store
    ),
    store
  };
};
