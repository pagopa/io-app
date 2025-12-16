import { constUndefined } from "fp-ts/lib/function";
import { fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";
import { appReducer } from "../../../../../store/reducers";
import { applicationChangeState } from "../../../../../store/actions/application";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { PreconditionsFooter } from "../PreconditionsFooter";
import { MESSAGES_ROUTES } from "../../../navigation/routes";
import { TagEnum } from "../../../../../../definitions/backend/MessageCategoryBase";
import * as messagePrecondition from "../../../store/reducers/messagePrecondition";
import * as urlUtils from "../../../../../utils/url";
import * as analytics from "../../../analytics";
import { mockAccessibilityInfo } from "../../../../../utils/testAccessibility";

describe("PreconditionsFooter", () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    mockAccessibilityInfo(false);
  });
  it("should match snapshot for 'content' footer category", () => {
    jest
      .spyOn(messagePrecondition, "preconditionsFooterSelector")
      .mockImplementation(_ => "content");
    const component = renderComponent();
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot for 'update' footer category", () => {
    jest
      .spyOn(messagePrecondition, "preconditionsFooterSelector")
      .mockImplementation(_ => "update");
    const component = renderComponent();
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot for 'view' footer category", () => {
    jest
      .spyOn(messagePrecondition, "preconditionsFooterSelector")
      .mockImplementation(_ => "view");
    const component = renderComponent();
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot for 'undefined' footer category", () => {
    jest
      .spyOn(messagePrecondition, "preconditionsFooterSelector")
      .mockImplementation(constUndefined);
    const component = renderComponent();
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should call 'onDismiss' and 'openAppStoreUrl' when footer category is 'update' and the related buttons have been pressed", () => {
    jest
      .spyOn(messagePrecondition, "preconditionsFooterSelector")
      .mockImplementation(_ => "update");
    const mockOpenAppStoreUrl = jest.fn();
    jest
      .spyOn(urlUtils, "openAppStoreUrl")
      .mockImplementation(_ => mockOpenAppStoreUrl());
    const mockOnDismiss = jest.fn();
    const component = renderComponent(mockOnDismiss);
    const cancelButton = component.getByTestId(
      "message_preconditions_footer_update_cancel"
    );
    fireEvent(cancelButton, "onPress");
    expect(mockOnDismiss.mock.calls.length).toBe(1);

    const updateButton = component.getByTestId(
      "message_preconditions_footer_update"
    );
    fireEvent(updateButton, "onPress");
    expect(mockOpenAppStoreUrl.mock.calls.length).toBe(1);
  });
  it("should call 'trackNotificationRejected'+'onDismiss' and 'trackUxConversion'+'onNavigation'+'onDismiss' when footer category is 'content' and the related buttons have been pressed", () => {
    jest
      .spyOn(messagePrecondition, "preconditionsFooterSelector")
      .mockImplementation(_ => "content");
    const categoryTag = TagEnum.GENERIC;
    jest
      .spyOn(messagePrecondition, "preconditionsCategoryTagSelector")
      .mockImplementation(_ => categoryTag);
    const messageId = "01J1NE8BY7YV0WJ2240HNQ2KJN";
    jest
      .spyOn(messagePrecondition, "preconditionsMessageIdSelector")
      .mockImplementation(_ => messageId);
    const mockTrackNotificationRejected = jest.fn();
    jest
      .spyOn(analytics, "trackNotificationRejected")
      .mockImplementation(_ => mockTrackNotificationRejected(_));
    const mockUXConversion = jest.fn();
    jest
      .spyOn(analytics, "trackUxConversion")
      .mockImplementation(_ => mockUXConversion(_));

    const mockOnDismiss = jest.fn();
    const mockNavigation = jest.fn();
    const component = renderComponent(mockOnDismiss, mockNavigation);
    const cancelButton = component.getByTestId(
      "message_preconditions_footer_cancel"
    );
    fireEvent(cancelButton, "onPress");
    expect(mockTrackNotificationRejected.mock.calls.length).toBe(1);
    expect(mockTrackNotificationRejected.mock.calls[0][1]).toStrictEqual(
      analytics.trackNotificationRejected(categoryTag)
    );
    expect(mockOnDismiss.mock.calls.length).toBe(1);

    const continueButton = component.getByTestId(
      "message_preconditions_footer_continue"
    );
    fireEvent(continueButton, "onPress");
    expect(mockUXConversion.mock.calls.length).toBe(1);
    expect(mockUXConversion.mock.calls[0][1]).toStrictEqual(
      analytics.trackUxConversion(categoryTag)
    );
    expect(mockNavigation.mock.calls.length).toBe(1);
    expect(mockNavigation.mock.calls[0][0]).toBe(messageId);
    expect(mockOnDismiss.mock.calls.length).toBe(2);
  });
});

const renderComponent = (
  onDismiss: () => void = jest.fn(),
  onNavigation: () => void = jest.fn()
) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);

  return renderScreenWithNavigationStoreContext(
    () => (
      <PreconditionsFooter
        onDismiss={onDismiss}
        onNavigation={onNavigation}
        onFooterHeightAvailable={_height => undefined}
      />
    ),
    MESSAGES_ROUTES.MESSAGES_HOME,
    {},
    store
  );
};
