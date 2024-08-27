import React from "react";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { createStore } from "redux";
import { fireEvent } from "@testing-library/react-native";
import { EmptyList } from "../EmptyList";
import { MessageListCategory } from "../../../types/messageListCategory";
import { MESSAGES_ROUTES } from "../../../navigation/routes";
import { appReducer } from "../../../../../store/reducers";
import { applicationChangeState } from "../../../../../store/actions/application";
import { preferencesDesignSystemSetEnabled } from "../../../../../store/actions/persistedPreferences";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { GlobalState } from "../../../../../store/reducers/types";
import {
  MessagePage,
  MessagePagePot
} from "../../../store/reducers/allPaginated";
import { UIMessage } from "../../../types";
import { reloadAllMessages } from "../../../store/actions";
import { pageSize } from "../../../../../config";

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  ...jest.requireActual<typeof import("react-redux")>("react-redux"),
  useDispatch: () => mockDispatch
}));

describe("EmptyList", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });
  it("should match snapshot, INBOX   category, pot.none", () => {
    const component = renderComponent("INBOX", pot.none);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, INBOX   category, pot.noneLoading", () => {
    const component = renderComponent("INBOX", pot.noneLoading);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, INBOX   category, pot.noneUpdating", () => {
    const component = renderComponent(
      "INBOX",
      pot.noneUpdating(nonEmptyMessagePagePot)
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, INBOX   category, pot.noneError", () => {
    const component = renderComponent(
      "INBOX",
      pot.noneError({ reason: "", time: new Date() })
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, INBOX   category, pot.some, empty data", () => {
    const component = renderComponent("INBOX", pot.some(emptyMessagePagePot));
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, INBOX   category, pot.some, non-empty data", () => {
    const component = renderComponent(
      "INBOX",
      pot.some(nonEmptyMessagePagePot)
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, INBOX   category, pot.someLoading, empty data", () => {
    const component = renderComponent(
      "INBOX",
      pot.someLoading(emptyMessagePagePot)
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, INBOX   category, pot.someLoading, non-empty data", () => {
    const component = renderComponent(
      "INBOX",
      pot.someLoading(nonEmptyMessagePagePot)
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, INBOX   category, pot.someUpdating, empty data", () => {
    const component = renderComponent(
      "INBOX",
      pot.someUpdating(emptyMessagePagePot, nonEmptyMessagePagePot)
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, INBOX   category, pot.someUpdating, non-empty data", () => {
    const component = renderComponent(
      "INBOX",
      pot.someUpdating(nonEmptyMessagePagePot, emptyMessagePagePot)
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, INBOX   category, pot.someError, empty data", () => {
    const component = renderComponent(
      "INBOX",
      pot.someError(emptyMessagePagePot, { reason: "", time: new Date() })
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, INBOX   category, pot.someError, non-empty data", () => {
    const component = renderComponent(
      "INBOX",
      pot.someError(nonEmptyMessagePagePot, { reason: "", time: new Date() })
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, ARCHIVE category, pot.none", () => {
    const component = renderComponent("ARCHIVE", pot.none);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, ARCHIVE category, pot.noneLoading", () => {
    const component = renderComponent("ARCHIVE", pot.noneLoading);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, ARCHIVE category, pot.noneUpdating", () => {
    const component = renderComponent(
      "ARCHIVE",
      pot.noneUpdating(nonEmptyMessagePagePot)
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, ARCHIVE category, pot.noneError", () => {
    const component = renderComponent(
      "ARCHIVE",
      pot.noneError({ reason: "", time: new Date() })
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, ARCHIVE category, pot.some, empty data", () => {
    const component = renderComponent("ARCHIVE", pot.some(emptyMessagePagePot));
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, ARCHIVE category, pot.some, non-empty data", () => {
    const component = renderComponent(
      "ARCHIVE",
      pot.some(nonEmptyMessagePagePot)
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, ARCHIVE category, pot.someLoading, empty data", () => {
    const component = renderComponent(
      "ARCHIVE",
      pot.someLoading(emptyMessagePagePot)
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, ARCHIVE category, pot.someLoading, non-empty data", () => {
    const component = renderComponent(
      "ARCHIVE",
      pot.someLoading(nonEmptyMessagePagePot)
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, ARCHIVE category, pot.someUpdating, empty data", () => {
    const component = renderComponent(
      "ARCHIVE",
      pot.someUpdating(emptyMessagePagePot, nonEmptyMessagePagePot)
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, ARCHIVE category, pot.someUpdating, non-empty data", () => {
    const component = renderComponent(
      "ARCHIVE",
      pot.someUpdating(nonEmptyMessagePagePot, emptyMessagePagePot)
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, ARCHIVE category, pot.someError, empty data", () => {
    const component = renderComponent(
      "ARCHIVE",
      pot.someError(emptyMessagePagePot, { reason: "", time: new Date() })
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, ARCHIVE category, pot.someError, non-empty data", () => {
    const component = renderComponent(
      "ARCHIVE",
      pot.someError(nonEmptyMessagePagePot, { reason: "", time: new Date() })
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("when displaying INBOX, pot.noneError, should dispatch reloadAllMessages.request on 'reload' button tap", () => {
    const component = renderComponent(
      "INBOX",
      pot.noneError({ reason: "", time: new Date() })
    );
    const inboxRetryButton = component.getByTestId("home_emptyList_retry");
    expect(inboxRetryButton).toBeDefined();
    fireEvent.press(inboxRetryButton);
    expect(mockDispatch.mock.calls[0][0]).toStrictEqual(
      reloadAllMessages.request({
        pageSize,
        filter: { getArchived: false },
        fromUserAction: true
      })
    );
  });
  it("when displaying ARCHIVE, pot.noneError, should dispatch reloadAllMessages.request on 'reload' button tap", () => {
    const component = renderComponent(
      "ARCHIVE",
      pot.noneError({ reason: "", time: new Date() })
    );
    const inboxRetryButton = component.getByTestId("home_emptyList_retry");
    expect(inboxRetryButton).toBeDefined();
    fireEvent.press(inboxRetryButton);
    expect(mockDispatch.mock.calls[0][0]).toStrictEqual(
      reloadAllMessages.request({
        pageSize,
        filter: { getArchived: true },
        fromUserAction: true
      })
    );
  });
});

const emptyMessageList: ReadonlyArray<UIMessage> = [];
const emptyMessagePagePot = {
  page: emptyMessageList
} as MessagePage;

const nonEmptyMessageList: ReadonlyArray<UIMessage> = [{} as UIMessage];
const nonEmptyMessagePagePot = {
  page: nonEmptyMessageList
} as MessagePage;

const renderComponent = (
  category: MessageListCategory,
  messagePagePot: MessagePagePot
) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const designSystemState = appReducer(
    initialState,
    preferencesDesignSystemSetEnabled({ isDesignSystemEnabled: true })
  );
  const finalState = {
    ...designSystemState,
    entities: {
      ...designSystemState.entities,
      messages: {
        ...designSystemState.entities.messages,
        allPaginated: {
          ...designSystemState.entities.messages.allPaginated,
          shownCategory: category,
          archive: {
            ...designSystemState.entities.messages.allPaginated.archive,
            data:
              category === "ARCHIVE"
                ? messagePagePot
                : designSystemState.entities.messages.allPaginated.archive.data
          },
          inbox: {
            ...designSystemState.entities.messages.allPaginated.inbox,
            data:
              category === "INBOX"
                ? messagePagePot
                : designSystemState.entities.messages.allPaginated.inbox.data
          }
        }
      }
    }
  } as GlobalState;

  const store = createStore(appReducer, finalState as any);

  return renderScreenWithNavigationStoreContext(
    () => <EmptyList category={category} />,
    MESSAGES_ROUTES.MESSAGES_HOME,
    {},
    store
  );
};
