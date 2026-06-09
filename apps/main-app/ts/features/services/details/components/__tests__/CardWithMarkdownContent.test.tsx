import * as O from "fp-ts/lib/Option";
import { act } from "@testing-library/react-native";
import configureMockStore from "redux-mock-store";
import { Store } from "redux";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { appReducer } from "../../../../../store/reducers";
import { applicationChangeState } from "../../../../../store/actions/application";
import { CardWithMarkdownContent } from "../CardWithMarkdownContent";
import { trackAppCaughtError } from "../../../../../utils/analytics";

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
    renderComponent(true, "Some markdown content");

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

const renderComponent = (ioMarkdownEnabled: boolean, content: string) => {
  const baseState = appReducer(undefined, applicationChangeState("active"));
  const globalState = {
    ...baseState,
    remoteConfig: O.some({
      cgn: {
        enabled: false
      },
      ioMarkdown: {
        min_app_version: {
          android: ioMarkdownEnabled ? "1.0.0.0" : "3.0.0.0",
          ios: ioMarkdownEnabled ? "1.0.0.0" : "3.0.0.0"
        }
      }
    })
  } as GlobalState;
  const mockStore = configureMockStore<GlobalState>();
  const store: Store<GlobalState> = mockStore(globalState);

  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => <CardWithMarkdownContent content={content} />,
    "DUMMY",
    {},
    store
  );
};
