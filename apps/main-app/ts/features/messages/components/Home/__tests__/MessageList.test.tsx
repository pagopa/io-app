import { MessageCategory } from "@io-app/api-types/generated/definitions/communication/MessageCategory";
import { ServiceId } from "@io-app/api-types/generated/definitions/services/ServiceId";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { act, fireEvent, within } from "@testing-library/react-native";
import { ReactElement } from "react";
import { RefreshControlProps, View } from "react-native";
import { createStore } from "redux";

import { pageSize } from "../../../../../config";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { mockAccessibilityInfo } from "../../../../../utils/testAccessibility";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { MESSAGES_ROUTES } from "../../../navigation/routes";
import {
  loadNextPageMessages,
  reloadAllMessages
} from "../../../store/actions";
import { toggleScheduledMessageArchivingAction } from "../../../store/actions/archiving";
import { UIMessage } from "../../../types";
import { MessageListCategory } from "../../../types/messageListCategory";
import * as listItemMessage from "../DS/ListItemMessage";
import * as homeUtils from "../homeUtils";
import { MessageList } from "../MessageList";

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  ...jest.requireActual<typeof import("react-redux")>("react-redux"),
  useDispatch: () => mockDispatch
}));

// Avoid Skottie errrors because the `jest` environment doesn't support it
jest.mock("../../../../../components/ui/AnimatedPictogram", () => ({
  AnimatedPictogram: () => null,
  IOAnimatedPictogramsAssets: {}
}));

describe("MessageList", () => {
  beforeEach(() => {
    mockDispatch.mockReset();
    jest.restoreAllMocks();
    mockAccessibilityInfo(false);
  });
  test.each<MessageListCategory>(["INBOX", "ARCHIVE"])(
    "renders section tabs inside the scrollable %s list header",
    category => {
      const component = renderComponent(
        category,
        <View testID="section_tabs" />
      );
      const list = component.getByTestId(
        `message_list_${category.toLowerCase()}`
      );

      expect(within(list).getByTestId("section_tabs")).toBeTruthy();
      expect(list.props.stickyHeaderIndices).toBeUndefined();
    }
  );
  test.each<MessageListCategory>(["INBOX", "ARCHIVE"])(
    "updates the selected row in %s",
    category => {
      const renderRow = jest
        .spyOn(listItemMessage, "ListItemMessage")
        .mockImplementation(() => <View />);
      const message: UIMessage = {
        id: "message-1",
        category: { tag: "GENERIC" } as MessageCategory,
        createdAt: new Date(2026, 0, 1),
        hasPrecondition: false,
        isArchived: category === "ARCHIVE",
        isRead: false,
        organizationFiscalCode: "00000000000",
        organizationName: "Organization",
        serviceId: "service-1" as ServiceId,
        serviceName: "Service",
        title: "Message"
      };
      const component = renderComponent(
        category,
        <View testID="section_tabs" />,
        [message]
      );
      expect(renderRow).toHaveBeenCalled();
      renderRow.mockClear();

      act(() => {
        component.store.dispatch(
          toggleScheduledMessageArchivingAction({
            messageId: message.id,
            fromInboxToArchive: category === "INBOX"
          })
        );
      });

      expect(renderRow).toHaveBeenCalled();
      expect(renderRow.mock.lastCall?.[0].selected).toBe(true);
    }
  );
  it("should dispatch 'loadNextPageMessages.request' when output from 'getLoadNextPageMessagesActionIfNeeded' is not undefined", () => {
    const expectedCategory: MessageListCategory = "INBOX";
    const expectedAction = loadNextPageMessages.request({
      pageSize,
      cursor: "01J0B4PFPP24MBX6K8ZYQXXBDW",
      filter: { getArchived: false },
      fromUserAction: false
    });
    jest
      .spyOn(homeUtils, "getLoadNextPageMessagesActionIfAllowed")
      .mockImplementation((_state, category) =>
        category === expectedCategory ? expectedAction : undefined
      );

    const component = renderComponent(expectedCategory);
    const messageList = component.getByTestId("message_list_inbox");
    expect(messageList).toBeTruthy();

    fireEvent(messageList, "endReached", { distanceFromEnd: 0 });

    expect(mockDispatch.mock.calls.length).toBe(1);
    expect(mockDispatch.mock.calls[0][0]).toStrictEqual(expectedAction);
  });
  it("should not dispatch 'loadNextPageMessages.request' when output from 'getLoadNextPageMessagesActionIfNeeded' is undefined", () => {
    const expectedCategory: MessageListCategory = "INBOX";
    const unexpectedAction = loadNextPageMessages.request({
      pageSize,
      cursor: "01J0B4PFPP24MBX6K8ZYQXXBDW",
      filter: { getArchived: true },
      fromUserAction: false
    });
    jest
      .spyOn(homeUtils, "getLoadNextPageMessagesActionIfAllowed")
      .mockImplementation((_state, category) =>
        category === expectedCategory ? undefined : unexpectedAction
      );

    const component = renderComponent(expectedCategory);
    const messageList = component.getByTestId("message_list_inbox");
    expect(messageList).toBeTruthy();

    fireEvent(messageList, "endReached", { distanceFromEnd: 0 });

    expect(mockDispatch.mock.calls.length).toBe(0);
  });
  it("should dispatch 'reloadAllMessages.request' when output from 'getReloadAllMessagesActionForRefreshIfAllowed' is not undefined, INBOX", () => {
    const expectedCategory: MessageListCategory = "INBOX";
    const expectedAction = reloadAllMessages.request({
      pageSize,
      filter: { getArchived: false },
      fromUserAction: false
    });
    jest
      .spyOn(homeUtils, "getReloadAllMessagesActionForRefreshIfAllowed")
      .mockImplementation((_state, category) =>
        category === expectedCategory ? expectedAction : undefined
      );

    const component = renderComponent(expectedCategory);
    const messageList = component.getByTestId("message_list_inbox");
    expect(messageList).toBeTruthy();

    const { refreshControl } = messageList.props;
    expect(refreshControl).toBeTruthy();

    const { onRefresh } = refreshControl.props as RefreshControlProps;
    expect(onRefresh).toBeTruthy();

    onRefresh!();

    expect(mockDispatch.mock.calls.length).toBe(1);
    expect(mockDispatch.mock.calls[0][0]).toStrictEqual(expectedAction);
  });
  it("should dispatch 'reloadAllMessages.request' when output from 'getReloadAllMessagesActionForRefreshIfAllowed' is not undefined, ARCHIVE", () => {
    const expectedCategory: MessageListCategory = "ARCHIVE";
    const expectedAction = reloadAllMessages.request({
      pageSize,
      filter: { getArchived: true },
      fromUserAction: false
    });
    jest
      .spyOn(homeUtils, "getReloadAllMessagesActionForRefreshIfAllowed")
      .mockImplementation((_state, category) =>
        category === expectedCategory ? expectedAction : undefined
      );

    const component = renderComponent(expectedCategory);
    const messageList = component.getByTestId("message_list_archive");
    expect(messageList).toBeTruthy();

    const { refreshControl } = messageList.props;
    expect(refreshControl).toBeTruthy();

    const { onRefresh } = refreshControl.props as RefreshControlProps;
    expect(onRefresh).toBeTruthy();

    onRefresh!();

    expect(mockDispatch.mock.calls.length).toBe(1);
    expect(mockDispatch.mock.calls[0][0]).toStrictEqual(expectedAction);
  });
  it("should not dispatch 'reloadAllMessages.request' when output from 'getReloadAllMessagesActionForRefreshIfAllowed' is undefined", () => {
    const expectedCategory: MessageListCategory = "INBOX";
    const expectedAction = reloadAllMessages.request({
      pageSize,
      filter: { getArchived: false },
      fromUserAction: false
    });
    jest
      .spyOn(homeUtils, "getReloadAllMessagesActionForRefreshIfAllowed")
      .mockImplementation((_state, category) =>
        category === expectedCategory ? undefined : expectedAction
      );

    const component = renderComponent(expectedCategory);
    const messageList = component.getByTestId("message_list_inbox");
    expect(messageList).toBeTruthy();

    const { refreshControl } = messageList.props;
    expect(refreshControl).toBeTruthy();

    const { onRefresh } = refreshControl.props as RefreshControlProps;
    expect(onRefresh).toBeTruthy();

    onRefresh!();

    expect(mockDispatch.mock.calls.length).toBe(0);
  });
  it("should have the refresh control set", () => {
    const expectedCategory: MessageListCategory = "INBOX";
    const component = renderComponent(expectedCategory);
    const messageList = component.getByTestId("message_list_inbox");
    expect(messageList).toBeTruthy();

    const { refreshControl } = messageList.props;
    expect(refreshControl).toBeTruthy();

    expect(
      (refreshControl.props as RefreshControlProps).onRefresh
    ).toBeTruthy();
  });
});

const renderComponent = (
  category: MessageListCategory,
  header?: ReactElement,
  messages?: Array<UIMessage>
) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const collectionKey = category === "INBOX" ? "inbox" : "archive";
  const state = {
    ...initialState,
    entities: {
      ...initialState.entities,
      messages: {
        ...initialState.entities.messages,
        allPaginated: {
          ...initialState.entities.messages.allPaginated,
          ...(messages
            ? {
                [collectionKey]: {
                  ...initialState.entities.messages.allPaginated[collectionKey],
                  data: pot.some({ page: messages })
                }
              }
            : {})
        }
      }
    }
  };
  const store = createStore(appReducer, state as any);

  return {
    ...renderScreenWithNavigationStoreContext(
      () => <MessageList category={category} NavigationBar={header} />,
      MESSAGES_ROUTES.MESSAGES_HOME,
      {},
      store
    ),
    store
  };
};
