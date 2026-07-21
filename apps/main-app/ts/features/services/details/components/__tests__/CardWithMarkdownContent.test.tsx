import { act } from "@testing-library/react-native";
import { Store } from "redux";
import configureMockStore from "redux-mock-store";

import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { trackAppCaughtError } from "../../../../../utils/analytics";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { CardWithMarkdownContent } from "../CardWithMarkdownContent";

// eslint-disable-next-line functional/no-let
let capturedOnError:
  | ((error: unknown, componentStack: string | undefined) => void)
  | undefined;
jest.mock("../../../../../components/IOMarkdown", () => {
  const { Text, View } = require("react-native");
  return {
    __esModule: true,
    default: (props: { content: string; onError?: typeof capturedOnError }) => {
      capturedOnError = props.onError;
      return (
        <View>
          <Text>{props.content}</Text>
        </View>
      );
    }
  };
});

jest.mock("../../../../../utils/analytics", () => ({
  ...jest.requireActual<Record<string, unknown>>(
    "../../../../../utils/analytics"
  ),
  trackAppCaughtError: jest.fn()
}));

jest.mock("react-native-device-info", () => ({
  getReadableVersion: () => "2.0.0.0",
  getVersion: () => "2.0.0.0",
  isDisplayZoomed: () => false
}));

describe("CardWithMarkdownContent", () => {
  beforeEach(() => {
    capturedOnError = undefined;
    jest.clearAllMocks();
  });

  it("should call trackAppCaughtError when IOMarkdown triggers onError", () => {
    renderComponent("Some markdown content");

    const testError = "Rendering failure";
    act(() => {
      capturedOnError?.(testError, undefined);
    });

    expect(trackAppCaughtError).toHaveBeenCalledWith(
      "CardWithMarkdownContent",
      "Unable to render service's markdown",
      testError
    );
  });
});

const renderComponent = (content: string) => {
  const baseState = appReducer(undefined, applicationChangeState("active"));
  const mockStore = configureMockStore<GlobalState>();
  const store: Store<GlobalState> = mockStore(baseState);

  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => <CardWithMarkdownContent content={content} />,
    "DUMMY",
    {},
    store
  );
};
