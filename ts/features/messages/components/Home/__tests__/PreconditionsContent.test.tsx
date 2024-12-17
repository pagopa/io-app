import { constUndefined } from "fp-ts/lib/function";
import { createStore } from "redux";
import { appReducer } from "../../../../../store/reducers";
import { applicationChangeState } from "../../../../../store/actions/application";
import { preferencesDesignSystemSetEnabled } from "../../../../../store/actions/persistedPreferences";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { PreconditionsContent } from "../PreconditionsContent";
import { MESSAGES_ROUTES } from "../../../navigation/routes";
import * as messagePreconditions from "../../../store/reducers/messagePrecondition";
import * as backendStatus from "../../../../../store/reducers/backendStatus/remoteConfig";
import { MarkdownProps } from "../../../../../components/ui/Markdown/Markdown";
import {
  errorPreconditionStatusAction,
  shownPreconditionStatusAction,
  toErrorPayload,
  toShownPayload
} from "../../../store/actions/preconditions";
import { TagEnum } from "../../../../../../definitions/backend/MessageCategoryBase";
import * as analytics from "../../../analytics";
import { mockAccessibilityInfo } from "../../../../../utils/testAccessibility";

jest.mock("../../MessageDetail/MessageMarkdown");

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  ...jest.requireActual<typeof import("react-redux")>("react-redux"),
  useDispatch: () => mockDispatch
}));

describe("PreconditionsContent", () => {
  afterEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
    mockAccessibilityInfo(false);
  });
  it("should match snapshot when content category is 'content' but markdown is undefined", () => {
    jest
      .spyOn(messagePreconditions, "preconditionsContentSelector")
      .mockImplementation(_ => "content");
    jest
      .spyOn(messagePreconditions, "preconditionsContentMarkdownSelector")
      .mockImplementation(constUndefined);
    const component = renderComponent();
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot when content category is 'content' and markdown is defined", () => {
    jest
      .spyOn(messagePreconditions, "preconditionsContentSelector")
      .mockImplementation(_ => "content");
    jest
      .spyOn(messagePreconditions, "preconditionsContentMarkdownSelector")
      .mockImplementation(_ => "A markdown content");
    const component = renderComponent();
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot when content category is 'error'", () => {
    jest
      .spyOn(messagePreconditions, "preconditionsContentSelector")
      .mockImplementation(_ => "error");
    const component = renderComponent();
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot when content category is 'loading'", () => {
    jest
      .spyOn(messagePreconditions, "preconditionsContentSelector")
      .mockImplementation(_ => "loading");
    const component = renderComponent();
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot when content category is 'update' and SEND min app version is '1.0.0.0'", () => {
    jest
      .spyOn(messagePreconditions, "preconditionsContentSelector")
      .mockImplementation(_ => "update");
    jest
      .spyOn(backendStatus, "pnMinAppVersionSelector")
      .mockImplementation(_ => "1.0.0.0");
    const component = renderComponent();
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot when content category is undefined", () => {
    jest
      .spyOn(messagePreconditions, "preconditionsContentSelector")
      .mockImplementation(constUndefined);
    const component = renderComponent();
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should dispatch `shownPreconditionStatusAction` when markdown loading completes", () => {
    jest
      .spyOn(messagePreconditions, "preconditionsContentSelector")
      .mockImplementation(_ => "content");
    jest
      .spyOn(messagePreconditions, "preconditionsContentMarkdownSelector")
      .mockImplementation(_ => "A markdown content");
    const component = renderComponent();
    const mockMessageMarkdown = component.getByTestId(
      "preconditions_content_message_markdown"
    );
    const props = mockMessageMarkdown.props as Omit<MarkdownProps, "cssStyle">;
    const onLoadEndCallback = props.onLoadEnd;
    expect(onLoadEndCallback).toBeTruthy();

    onLoadEndCallback?.();

    expect(mockDispatch.mock.calls.length).toBe(1);
    expect(mockDispatch.mock.calls[0][0]).toStrictEqual(
      shownPreconditionStatusAction(toShownPayload())
    );
  });
  it("should track an error and dispatch 'errorPreconditionStatusAction' when an error occours during markdown loading", () => {
    jest
      .spyOn(messagePreconditions, "preconditionsContentSelector")
      .mockImplementation(_ => "content");
    jest
      .spyOn(messagePreconditions, "preconditionsContentMarkdownSelector")
      .mockImplementation(_ => "A markdown content");
    const categoryTag = TagEnum.GENERIC;
    jest
      .spyOn(messagePreconditions, "preconditionsCategoryTagSelector")
      .mockImplementation(_ => categoryTag);
    const mockTrackDislaimerLoadError = jest.fn();
    jest
      .spyOn(analytics, "trackDisclaimerLoadError")
      .mockImplementation(mockTrackDislaimerLoadError);
    const component = renderComponent();
    const mockMessageMarkdown = component.getByTestId(
      "preconditions_content_message_markdown"
    );
    const props = mockMessageMarkdown.props as Omit<MarkdownProps, "cssStyle">;
    const onErrorCallback = props.onError;
    expect(onErrorCallback).toBeTruthy();

    const expectedError = new Error("An error");
    onErrorCallback?.(expectedError);

    expect(mockTrackDislaimerLoadError.mock.calls.length).toBe(1);
    expect(mockTrackDislaimerLoadError.mock.calls[0][0]).toStrictEqual(
      categoryTag
    );

    expect(mockDispatch.mock.calls.length).toBe(1);
    expect(mockDispatch.mock.calls[0][0]).toStrictEqual(
      errorPreconditionStatusAction(
        toErrorPayload(`Markdown loading failure (${expectedError})`)
      )
    );
  });
});

const renderComponent = () => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const designSystemState = appReducer(
    initialState,
    preferencesDesignSystemSetEnabled({ isDesignSystemEnabled: true })
  );
  const store = createStore(appReducer, designSystemState as any);

  return renderScreenWithNavigationStoreContext(
    () => <PreconditionsContent />,
    MESSAGES_ROUTES.MESSAGES_HOME,
    {},
    store
  );
};
