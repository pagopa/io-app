import { MessageCategory } from "@io-app/api-types/generated/definitions/communication/MessageCategory";
import { ServiceId } from "@io-app/api-types/generated/definitions/services/ServiceId";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { cleanup, fireEvent, within } from "@testing-library/react-native";
import { ScrollView } from "react-native";
import { createStore } from "redux";

import { pageSize } from "../../../../../config";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { mockAccessibilityInfo } from "../../../../../utils/testAccessibility";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { MESSAGES_ROUTES } from "../../../navigation/routes";
import {
  reloadAllMessages,
  setShownMessageCategoryAction
} from "../../../store/actions";
import { MessagePagePot } from "../../../store/reducers/allPaginated/types";
import { UIMessage } from "../../../types";
import { MessageListCategory } from "../../../types/messageListCategory";
import { MessagesListContainer } from "../MessagesListContainer";

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  ...jest.requireActual<typeof import("react-redux")>("react-redux"),
  useDispatch: () => mockDispatch
}));

// Avoid Skottie errors because the `jest` environment doesn't support it
jest.mock("../../../../../components/ui/AnimatedPictogram", () => ({
  AnimatedPictogram: () => null,
  IOAnimatedPictogramsAssets: {}
}));

const emptyPage = pot.some({ page: [] });

const generateMessage = (id: string, isArchived: boolean): UIMessage => ({
  id,
  category: { tag: "GENERIC" } as MessageCategory,
  createdAt: new Date(2026, 0, 1),
  hasPrecondition: false,
  isArchived,
  isRead: false,
  organizationFiscalCode: "00000000000",
  organizationName: "Organization",
  serviceId: "service-1" as ServiceId,
  serviceName: "Service",
  title: "Message"
});

const isRowSelected = (row: ReturnType<typeof within>) =>
  row.getByTestId("AnimatedMessageCheckboxInput").props.accessibilityState
    .checked;

describe("MessagesListContainer", () => {
  beforeEach(() => {
    jest.useFakeTimers({ doNotFake: ["queueMicrotask", "setImmediate"] });
    mockDispatch.mockReset();
    mockAccessibilityInfo(false);
  });

  afterEach(() => {
    cleanup();
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test.each<MessageListCategory>(["INBOX", "ARCHIVE"])(
    "loads the %s category on its initial mount when uncached",
    category => {
      const { component } = renderComponent(category, pot.none, pot.none);

      expect(
        component.getByTestId(`message_list_${category.toLowerCase()}`)
      ).toBeTruthy();
      expect(mockDispatch).toHaveBeenCalledWith(
        reloadAllMessages.request({
          pageSize,
          filter: { getArchived: category === "ARCHIVE" },
          fromUserAction: false
        })
      );
    }
  );

  it("does not reload cached categories", () => {
    renderComponent("INBOX", emptyPage, emptyPage);

    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it("does not automatically reload an initially failed category", () => {
    renderComponent(
      "INBOX",
      pot.noneError({ reason: "", time: new Date() }),
      pot.none
    );

    expect(mockDispatch).not.toHaveBeenCalled();
  });

  test.each<MessageListCategory>(["INBOX", "ARCHIVE"])(
    "renders only the %s list with the section tabs nested inside it",
    category => {
      const { component } = renderComponent(category, emptyPage, emptyPage);
      const otherCategory = category === "INBOX" ? "archive" : "inbox";

      const list = component.getByTestId(
        `message_list_${category.toLowerCase()}`
      );
      expect(
        component.queryByTestId(`message_list_${otherCategory}`)
      ).toBeNull();
      expect(within(list).getByTestId("home_tab_item_inbox")).toBeTruthy();
      expect(within(list).getByTestId("home_tab_item_archive")).toBeTruthy();
    }
  );

  it("switches list, syncs the store and loads the uncached category when a different tab is pressed", () => {
    const { component, store } = renderComponent("INBOX", emptyPage, pot.none);
    mockDispatch.mockImplementation(store.dispatch);
    const initialList = component.getByTestId("message_list_inbox");

    fireEvent.press(component.getByTestId("home_tab_item_archive"));

    expect(component.queryByTestId("message_list_inbox")).toBeNull();
    expect(component.getByTestId("message_list_archive")).toBe(initialList);
    expect(mockDispatch).toHaveBeenCalledWith(
      setShownMessageCategoryAction("ARCHIVE")
    );
    expect(mockDispatch).toHaveBeenCalledWith(
      reloadAllMessages.request({
        pageSize,
        filter: { getArchived: true },
        fromUserAction: false
      })
    );
  });

  it("scrolls back to the top when switching category", () => {
    const { component } = renderComponent("INBOX", emptyPage, emptyPage);
    const scrollTo = jest.spyOn(ScrollView.prototype, "scrollTo");
    scrollTo.mockClear();

    fireEvent.press(component.getByTestId("home_tab_item_archive"));

    expect(scrollTo).toHaveBeenCalledWith(
      expect.objectContaining({ y: 0, animated: false })
    );
  });

  it("keeps messages scheduled for archiving selected across category switches", () => {
    const inboxMessage = generateMessage("01J0B4PFPP24MBX6K8ZYQXXBDA", false);
    const archiveMessage = generateMessage("01J0B4PFPP24MBX6K8ZYQXXBDB", true);
    const { component, store } = renderComponent(
      "INBOX",
      pot.some({ page: [inboxMessage] }),
      pot.some({ page: [archiveMessage] })
    );
    mockDispatch.mockImplementation(store.dispatch);
    const inboxRow = () =>
      within(component.getByTestId("wrapped_message_list_item_0"));

    fireEvent(
      component.getByTestId("wrapped_message_list_item_0"),
      "longPress"
    );
    expect(isRowSelected(inboxRow())).toBe(true);

    fireEvent.press(component.getByTestId("home_tab_item_archive"));
    expect(component.getByTestId("message_list_archive")).toBeTruthy();
    expect(isRowSelected(inboxRow())).toBe(false);

    fireEvent.press(component.getByTestId("home_tab_item_inbox"));
    expect(component.getByTestId("message_list_inbox")).toBeTruthy();
    expect(isRowSelected(inboxRow())).toBe(true);
  });

  it("does nothing when the selected tab is pressed again", () => {
    const { component } = renderComponent("INBOX", emptyPage, emptyPage);

    fireEvent.press(component.getByTestId("home_tab_item_inbox"));

    expect(component.getByTestId("message_list_inbox")).toBeTruthy();
    expect(mockDispatch).not.toHaveBeenCalled();
  });
});

const renderComponent = (
  shownCategory: MessageListCategory,
  inboxMessagePagePot: MessagePagePot,
  archiveMessagePagePot: MessagePagePot
) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const finalState = {
    ...initialState,
    entities: {
      ...initialState.entities,
      messages: {
        ...initialState.entities.messages,
        allPaginated: {
          ...initialState.entities.messages.allPaginated,
          shownCategory,
          archive: {
            ...initialState.entities.messages.allPaginated.archive,
            data: archiveMessagePagePot
          },
          inbox: {
            ...initialState.entities.messages.allPaginated.inbox,
            data: inboxMessagePagePot
          }
        }
      }
    }
  } as GlobalState;
  const store = createStore(appReducer, finalState as any);

  return {
    component: renderScreenWithNavigationStoreContext(
      () => <MessagesListContainer />,
      MESSAGES_ROUTES.MESSAGES_HOME,
      {},
      store
    ),
    store
  };
};
