import * as pot from "@pagopa/ts-commons/lib/pot";
import { RefObject } from "react";
import { NativeSyntheticEvent } from "react-native";
import PagerView from "react-native-pager-view";
import { OnPageSelectedEventData } from "react-native-pager-view/lib/typescript/PagerViewNativeComponent";
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
import { MessagePagePot } from "../../../store/reducers/allPaginated";
import { MessageListCategory } from "../../../types/messageListCategory";
import { PagerViewContainer } from "../PagerViewContainer";

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

describe("PagerViewContainer", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
    jest.restoreAllMocks();
    mockAccessibilityInfo(false);
  });
  it("should not dispatch 'reloadAllMessages.request' upon first rendering for INBOX with useEffect (since it is dispatched by the PagerView's pageSelected callback)", () => {
    renderComponent("INBOX", pot.none, pot.none);
    expect(mockDispatch.mock.calls.length).toBe(0);
  });
  it("should not dispatch 'reloadAllMessages.request' upon first rendering for ARCHIVE with useEffect (since it is dispatched by the PagerView's pageSelected callback)", () => {
    renderComponent("ARCHIVE", pot.none, pot.none);
    expect(mockDispatch.mock.calls.length).toBe(0);
  });
  it("should not dispatch 'reloadAllMessages.request' when INBOX has (empty) data, should dispatch both 'setShownMessageCategoryAction('ARCHIVE')' when setting page 1 and 'reloadAllMessages.request'", () => {
    const mockUseRefOutput: RefObject<PagerView | null> = {
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
        filter: { getArchived: true },
        fromUserAction: false
      })
    );
  });
  it("should not dispatch 'reloadAllMessages.request' when INBOX has (empty) data, should dispatch 'setShownMessageCategoryAction('ARCHIVE')' when setting page 1 but no 'reloadAllMessages.request' when ARCHIVE has data", () => {
    const mockUseRefOutput: RefObject<PagerView | null> = {
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
    const mockUseRefOutput: RefObject<PagerView | null> = {
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
        filter: { getArchived: false },
        fromUserAction: false
      })
    );
  });
  it("should not dispatch 'reloadAllMessages.request' when ARCHIVE has (empty) data, should dispatch 'setShownMessageCategoryAction('INBOX')' when setting page 0 but no 'reloadAllMessages.request' when INBOX has data", () => {
    const mockUseRefOutput: RefObject<PagerView | null> = {
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
  ref?: RefObject<PagerView | null>
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
      () => <PagerViewContainer ref={ref} />,
      MESSAGES_ROUTES.MESSAGES_HOME,
      {},
      store
    ),
    store
  };
};
