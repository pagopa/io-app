import { fireEvent, screen } from "@testing-library/react-native";
import { constUndefined } from "fp-ts/lib/function";
import { createStore } from "redux";

import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import * as backendStatus from "../../../../../store/reducers/backendStatus/remoteConfig";
import { mockAccessibilityInfo } from "../../../../../utils/testAccessibility";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { MESSAGES_ROUTES } from "../../../navigation/routes";
import * as messagePreconditions from "../../../store/reducers/messagePrecondition";
import { PreconditionsContent } from "../PreconditionsContent";

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  ...jest.requireActual<typeof import("react-redux")>("react-redux"),
  useDispatch: () => mockDispatch
}));

jest.mock("../../../../../components/ui/AnimatedPictogram", () => ({
  AnimatedPictogram: () => null,
  IOAnimatedPictogramsAssets: {}
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
  it("should render the markdown and open internal links through the given 'linkTo'", () => {
    jest
      .spyOn(messagePreconditions, "preconditionsContentSelector")
      .mockImplementation(_ => "content");
    jest
      .spyOn(messagePreconditions, "preconditionsContentMarkdownSelector")
      .mockImplementation(_ => "[Open messages](ioit://main/messages)");
    const linkTo = jest.fn();
    renderComponent(linkTo);

    fireEvent.press(screen.getByText("Open messages"));

    expect(linkTo).toHaveBeenCalledTimes(1);
    expect(linkTo).toHaveBeenCalledWith("/main/messages");
  });
});

const renderComponent = (linkTo: (path: string) => void = jest.fn()) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);

  return renderScreenWithNavigationStoreContext(
    () => <PreconditionsContent footerHeight={84} linkTo={linkTo} />,
    MESSAGES_ROUTES.MESSAGES_HOME,
    {},
    store
  );
};
