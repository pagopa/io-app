import React from "react";
import * as pot from "@pagopa/ts-commons/lib/pot";
import PagerView from "react-native-pager-view";
import { createStore } from "redux";
import { OnPageSelectedEventData } from "react-native-pager-view/lib/typescript/PagerViewNativeComponent";
import { NativeSyntheticEvent } from "react-native";
import { applicationChangeState } from "../../../../../store/actions/application";
import { preferencesDesignSystemSetEnabled } from "../../../../../store/actions/persistedPreferences";
import { appReducer } from "../../../../../store/reducers";
import { MessageListCategory } from "../../../types/messageListCategory";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { PagerViewContainer } from "../PagerViewContainer";
import { MESSAGES_ROUTES } from "../../../navigation/routes";
import { GlobalState } from "../../../../../store/reducers/types";
import { MessagePagePot } from "../../../store/reducers/allPaginated";
import {
  reloadAllMessages,
  setShownMessageCategoryAction
} from "../../../store/actions";
import { pageSize } from "../../../../../config";

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  ...jest.requireActual<typeof import("react-redux")>("react-redux"),
  useDispatch: () => mockDispatch
}));

describe("PagerViewContainer", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });
  it("should dispatch 'reloadAllMessages.request' upon first rendering for INBOX", () => {
    renderComponent("INBOX", pot.none, pot.none);
    expect(mockDispatch.mock.calls.length).toBe(1);
    expect(mockDispatch.mock.calls[0][0]).toStrictEqual(
      reloadAllMessages.request({
        pageSize,
        filter: { getArchived: false }
      })
    );
  });
  it("should dispatch 'reloadAllMessages.request' upon first rendering for ARCHIVE", () => {
    renderComponent("ARCHIVE", pot.none, pot.none);
    expect(mockDispatch.mock.calls.length).toBe(1);
    expect(mockDispatch.mock.calls[0][0]).toStrictEqual(
      reloadAllMessages.request({
        pageSize,
        filter: { getArchived: true }
      })
    );
  });
  it("should not dispatch 'reloadAllMessages.request' when INBOX has (empty) data, should dispatch both 'setShownMessageCategoryAction('ARCHIVE')' when setting page 1 and 'reloadAllMessages.request'", () => {
    const mockUseRefOutput: React.MutableRefObject<PagerView | null> = {
      current: null
    };
    const { store } = renderComponent(
      "INBOX",
      pot.some({ page: [] }),
      pot.none,
      mockUseRefOutput
    );
    expect(mockUseRefOutput.current).toBeTruthy();
    expect(mockDispatch.mock.calls.length).toBe(0);

    mockDispatch.mockImplementationOnce(() =>
      store.dispatch(setShownMessageCategoryAction("ARCHIVE"))
    );

    const pageSelected = mockUseRefOutput.current?.props.onPageSelected;
    void pageSelected?.({
      nativeEvent: {
        position: 1
      }
    } as NativeSyntheticEvent<OnPageSelectedEventData>);

    expect(mockDispatch.mock.calls.length).toBe(2);
    expect(mockDispatch.mock.calls[0][0]).toStrictEqual(
      setShownMessageCategoryAction("ARCHIVE")
    );
    expect(mockDispatch.mock.calls[1][0]).toStrictEqual(
      reloadAllMessages.request({
        pageSize,
        filter: { getArchived: true }
      })
    );
  });
  it("should not dispatch 'reloadAllMessages.request' when INBOX has (empty) data, should dispatch 'setShownMessageCategoryAction('ARCHIVE')' when setting page 1 but no 'reloadAllMessages.request' when ARCHIVE has data", () => {
    const mockUseRefOutput: React.MutableRefObject<PagerView | null> = {
      current: null
    };
    const { store } = renderComponent(
      "INBOX",
      pot.some({ page: [] }),
      pot.some({ page: [] }),
      mockUseRefOutput
    );
    expect(mockUseRefOutput.current).toBeTruthy();
    expect(mockDispatch.mock.calls.length).toBe(0);

    mockDispatch.mockImplementationOnce(() =>
      store.dispatch(setShownMessageCategoryAction("ARCHIVE"))
    );

    const pageSelected = mockUseRefOutput.current?.props.onPageSelected;
    void pageSelected?.({
      nativeEvent: {
        position: 1
      }
    } as NativeSyntheticEvent<OnPageSelectedEventData>);

    expect(mockDispatch.mock.calls.length).toBe(1);
    expect(mockDispatch.mock.calls[0][0]).toStrictEqual(
      setShownMessageCategoryAction("ARCHIVE")
    );
    expect(mockDispatch.mock.calls[1]).toBeUndefined();
  });

  it("should not dispatch 'reloadAllMessages.request' when ARCHIVE has (empty) data, should dispatch both 'setShownMessageCategoryAction('INBOX')' when setting page 0 and 'reloadAllMessages.request'", () => {
    const mockUseRefOutput: React.MutableRefObject<PagerView | null> = {
      current: null
    };
    const { store } = renderComponent(
      "ARCHIVE",
      pot.none,
      pot.some({ page: [] }),
      mockUseRefOutput
    );
    expect(mockUseRefOutput.current).toBeTruthy();
    expect(mockDispatch.mock.calls.length).toBe(0);

    mockDispatch.mockImplementationOnce(() =>
      store.dispatch(setShownMessageCategoryAction("INBOX"))
    );

    const pageSelected = mockUseRefOutput.current?.props.onPageSelected;
    void pageSelected?.({
      nativeEvent: {
        position: 0
      }
    } as NativeSyntheticEvent<OnPageSelectedEventData>);

    expect(mockDispatch.mock.calls.length).toBe(2);
    expect(mockDispatch.mock.calls[0][0]).toStrictEqual(
      setShownMessageCategoryAction("INBOX")
    );
    expect(mockDispatch.mock.calls[1][0]).toStrictEqual(
      reloadAllMessages.request({
        pageSize,
        filter: { getArchived: false }
      })
    );
  });
  it("should not dispatch 'reloadAllMessages.request' when ARCHIVE has (empty) data, should dispatch 'setShownMessageCategoryAction('INBOX')' when setting page 0 but no 'reloadAllMessages.request' when INBOX has data", () => {
    const mockUseRefOutput: React.MutableRefObject<PagerView | null> = {
      current: null
    };
    const { store } = renderComponent(
      "ARCHIVE",
      pot.some({ page: [] }),
      pot.some({ page: [] }),
      mockUseRefOutput
    );
    expect(mockUseRefOutput.current).toBeTruthy();
    expect(mockDispatch.mock.calls.length).toBe(0);

    mockDispatch.mockImplementationOnce(() =>
      store.dispatch(setShownMessageCategoryAction("INBOX"))
    );

    const pageSelected = mockUseRefOutput.current?.props.onPageSelected;
    void pageSelected?.({
      nativeEvent: {
        position: 0
      }
    } as NativeSyntheticEvent<OnPageSelectedEventData>);

    expect(mockDispatch.mock.calls.length).toBe(1);
    expect(mockDispatch.mock.calls[0][0]).toStrictEqual(
      setShownMessageCategoryAction("INBOX")
    );
    expect(mockDispatch.mock.calls[1]).toBeUndefined();
  });
});

const renderComponent = (
  shownCategory: MessageListCategory,
  inboxMessagePagePot: MessagePagePot,
  archiveMessagePagePot: MessagePagePot,
  ref?: React.RefObject<PagerView>
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
          shownCategory,
          archive: {
            ...designSystemState.entities.messages.allPaginated.archive,
            data: archiveMessagePagePot
          },

          inbox: {
            ...designSystemState.entities.messages.allPaginated.inbox,
            data: inboxMessagePagePot
          }
        }
      }
    }
  } as GlobalState;
  const store = createStore(appReducer, finalState as any);

  return {
    component: renderScreenWithNavigationStoreContext(
      () => <PagerViewContainer ref={ref} />,
      MESSAGES_ROUTES.MESSAGES_HOME,
      {},
      store
    ),
    store
  };
};
