import { constUndefined } from "fp-ts/lib/function";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { Preconditions } from "../Preconditions";
import { MESSAGES_ROUTES } from "../../../navigation/routes";
import * as messagePrecondition from "../../../store/reducers/messagePrecondition";
import { TagEnum } from "../../../../../../definitions/backend/MessageCategoryBase";
import * as analytics from "../../../analytics";
import {
  idlePreconditionStatusAction,
  retrievingDataPreconditionStatusAction,
  toIdlePayload,
  toRetrievingDataPayload,
  toUpdateRequiredPayload,
  updateRequiredPreconditionStatusAction
} from "../../../store/actions/preconditions";
import * as bottomSheet from "../../../../../utils/hooks/bottomSheet";
import { PreconditionsFooterProps } from "../PreconditionsFooter";

jest.mock("../PreconditionsContent");

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  ...jest.requireActual<typeof import("react-redux")>("react-redux"),
  useDispatch: () => mockDispatch
}));

const mockNavigate = jest.fn();
jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual<typeof import("@react-navigation/native")>(
    "@react-navigation/native"
  ),
  useNavigation: () => ({
    navigate: mockNavigate
  })
}));

describe("Preconditions", () => {
  afterEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });
  it("should match snapshot with mocked components", () => {
    const component = renderComponent();
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should call 'trackDisclaimerOpened'+'present'+'dispatch(updateRequiredPreconditionStatusAction)' upon mounting, when 'preconditionsRequireAppUpdateSelector' returns true", () => {
    jest
      .spyOn(
        messagePrecondition,
        "shouldPresentPreconditionsBottomSheetSelector"
      )
      .mockImplementation(_ => true);
    const categoryTag = TagEnum.GENERIC;
    jest
      .spyOn(messagePrecondition, "preconditionsCategoryTagSelector")
      .mockImplementation(_ => categoryTag);
    const mockTrackDislaimerOpened = jest.fn();
    jest
      .spyOn(analytics, "trackDisclaimerOpened")
      .mockImplementation(mockTrackDislaimerOpened);
    jest
      .spyOn(messagePrecondition, "preconditionsRequireAppUpdateSelector")
      .mockImplementation(_ => true);
    const mockModalPresent = jest.fn();
    jest.spyOn(bottomSheet, "useIOBottomSheetModal").mockImplementation(_ => ({
      present: mockModalPresent,
      dismiss: () => undefined,
      dismissAll: () => undefined,
      bottomSheet: <></>
    }));

    renderComponent();

    expect(mockTrackDislaimerOpened.mock.calls.length).toBe(1);
    expect(mockTrackDislaimerOpened.mock.calls[0][0]).toStrictEqual(
      categoryTag
    );

    expect(mockModalPresent.mock.calls.length).toBe(1);

    expect(mockDispatch.mock.calls.length).toBe(1);
    expect(mockDispatch.mock.calls[0][0]).toStrictEqual(
      updateRequiredPreconditionStatusAction(toUpdateRequiredPayload())
    );
  });
  it("should call 'trackDisclaimerOpened'+'present'+'dispatch(retrievingDataPreconditionStatusAction)' upon mounting, when 'preconditionsRequireAppUpdateSelector' returns false", () => {
    jest
      .spyOn(
        messagePrecondition,
        "shouldPresentPreconditionsBottomSheetSelector"
      )
      .mockImplementation(_ => true);
    const categoryTag = TagEnum.GENERIC;
    jest
      .spyOn(messagePrecondition, "preconditionsCategoryTagSelector")
      .mockImplementation(_ => categoryTag);
    const mockTrackDislaimerOpened = jest.fn();
    jest
      .spyOn(analytics, "trackDisclaimerOpened")
      .mockImplementation(mockTrackDislaimerOpened);
    jest
      .spyOn(messagePrecondition, "preconditionsRequireAppUpdateSelector")
      .mockImplementation(_ => false);
    const mockModalPresent = jest.fn();
    // eslint-disable-next-line sonarjs/no-identical-functions
    jest.spyOn(bottomSheet, "useIOBottomSheetModal").mockImplementation(_ => ({
      present: mockModalPresent,
      dismiss: () => undefined,
      dismissAll: () => undefined,
      bottomSheet: <></>
    }));

    renderComponent();

    expect(mockTrackDislaimerOpened.mock.calls.length).toBe(1);
    expect(mockTrackDislaimerOpened.mock.calls[0][0]).toStrictEqual(
      categoryTag
    );

    expect(mockModalPresent.mock.calls.length).toBe(1);

    expect(mockDispatch.mock.calls.length).toBe(1);
    expect(mockDispatch.mock.calls[0][0]).toStrictEqual(
      retrievingDataPreconditionStatusAction(toRetrievingDataPayload())
    );
  });
  it("should provide 'PreconditionsFooter' with a navigation callback that navigates to the message router", () => {
    // eslint-disable-next-line functional/no-let
    let onNavigationCallback: (_messageId: string) => void = jest.fn();
    jest
      .spyOn(bottomSheet, "useIOBottomSheetModal")
      .mockImplementation(props => {
        onNavigationCallback = (props.footer?.props as PreconditionsFooterProps)
          ?.onNavigation;
        return {
          present: constUndefined,
          dismiss: constUndefined,
          dismissAll: constUndefined,
          bottomSheet: <></>
        };
      });

    renderComponent();

    expect(onNavigationCallback).toBeTruthy();

    const messageId = "01J1PVGMXAZ2SGCQ4H3341MARC";
    onNavigationCallback?.(messageId);

    expect(mockNavigate.mock.calls.length).toBe(1);
    expect(mockNavigate.mock.calls[0][0]).toStrictEqual(
      MESSAGES_ROUTES.MESSAGES_NAVIGATOR
    );
    expect(mockNavigate.mock.calls[0][1]).toStrictEqual({
      screen: MESSAGES_ROUTES.MESSAGE_ROUTER,
      params: {
        messageId,
        fromNotification: false
      }
    });
  });

  it("should provide 'PreconditionsFooter' with a dismiss callback that dispatches 'idlePreconditionStatusAction'", () => {
    // eslint-disable-next-line functional/no-let
    let onDismissCallback: (() => void) | undefined = jest.fn();
    jest
      .spyOn(bottomSheet, "useIOBottomSheetModal")
      .mockImplementation(props => {
        onDismissCallback = props.onDismiss;
        return {
          present: constUndefined,
          dismiss: constUndefined,
          dismissAll: constUndefined,
          bottomSheet: <></>
        };
      });

    renderComponent();

    expect(onDismissCallback).toBeTruthy();

    onDismissCallback?.();

    expect(mockDispatch.mock.calls.length).toBe(1);
    expect(mockDispatch.mock.calls[0][0]).toStrictEqual(
      idlePreconditionStatusAction(toIdlePayload())
    );
  });
  it("should provider the 'PreconditionsFooter' with the bottom sheet's 'dismiss' callback", () => {
    // eslint-disable-next-line functional/no-let
    let footerOnDismissCallback: (() => void) | undefined = jest.fn();
    const mockBottomSheetDismiss = jest.fn();
    jest
      .spyOn(bottomSheet, "useIOBottomSheetModal")
      .mockImplementation(props => {
        footerOnDismissCallback = (
          props.footer?.props as PreconditionsFooterProps
        )?.onDismiss;
        return {
          present: constUndefined,
          dismiss: mockBottomSheetDismiss,
          dismissAll: constUndefined,
          bottomSheet: <></>
        };
      });

    renderComponent();

    expect(footerOnDismissCallback).toBeTruthy();

    footerOnDismissCallback?.();

    expect(mockBottomSheetDismiss.mock.calls.length).toBe(1);
  });
});

const renderComponent = () => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);

  return renderScreenWithNavigationStoreContext(
    () => <Preconditions />,
    MESSAGES_ROUTES.MESSAGES_HOME,
    {},
    store
  );
};
