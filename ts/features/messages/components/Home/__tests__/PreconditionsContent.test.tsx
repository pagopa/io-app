import { constUndefined } from "fp-ts/lib/function";
import { createStore } from "redux";
import { appReducer } from "../../../../../store/reducers";
import { applicationChangeState } from "../../../../../store/actions/application";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { PreconditionsContent } from "../PreconditionsContent";
import { MESSAGES_ROUTES } from "../../../navigation/routes";
import * as messagePreconditions from "../../../store/reducers/messagePrecondition";
import * as backendStatus from "../../../../../store/reducers/backendStatus/remoteConfig";
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
});

const renderComponent = () => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);

  return renderScreenWithNavigationStoreContext(
    () => <PreconditionsContent footerHeight={84} />,
    MESSAGES_ROUTES.MESSAGES_HOME,
    {},
    store
  );
};
