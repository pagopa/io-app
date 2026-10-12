import { fireEvent, render } from "@testing-library/react-native";

import { withStore } from "../../../../../../utils/jest/withStore";
import * as cieAnalytics from "../../../../common/analytics/cieAnalytics";
import * as useCieManagerModule from "../../hooks/useCieManager";
import { OneIdentityCieCardReader as OneIdentityCieCardReaderComponent } from "../OneIdentityCieCardReader";

const mockGoBack = jest.fn();
const mockNavigate = jest.fn();
const mockStartReading = jest.fn();

jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual<typeof import("@react-navigation/native")>(
    "@react-navigation/native"
  ),
  useNavigation: () => ({
    goBack: mockGoBack,
    navigate: mockNavigate
  })
}));

const OneIdentityCieCardReader = withStore(OneIdentityCieCardReaderComponent);

jest.mock("../OneIdentityCieCardReaderFailure", () => {
  const { View } = require("react-native");
  return {
    OneIdentityCieCardReaderFailure: (props: any) => (
      <View testID="mock-failure" {...props} />
    )
  };
});
jest.mock("../OneIdentityCieCardReaderProgress", () => {
  const { View, Pressable } = require("react-native");
  return {
    OneIdentityCieCardReaderProgress: (props: any) => (
      <View testID="mock-progress" {...props}>
        <Pressable
          accessibilityRole="button"
          onPress={props.onCancel}
          testID="btn-cancel"
        />
        <Pressable
          accessibilityRole="button"
          onPress={props.onRetry}
          testID="btn-retry"
        />
      </View>
    )
  };
});

describe("OneIdentityCieCardReader", () => {
  const authenticationUrl = "https://idserver.example.com/authorize";
  const pin = "12345678";

  beforeEach(() => {
    jest.clearAllMocks();

    jest.spyOn(useCieManagerModule, "useCieManager").mockReturnValue({
      startReading: mockStartReading,
      state: { status: "idle" }
    });
  });

  it("should track the screen and start reading the card on first render", () => {
    jest
      .spyOn(cieAnalytics, "trackLoginCieCardReaderScreen")
      .mockImplementation();

    render(
      <OneIdentityCieCardReader
        authenticationUrl={authenticationUrl}
        onAuthorizationUrlReceived={jest.fn()}
        pin={pin}
      />
    );

    expect(cieAnalytics.trackLoginCieCardReaderScreen).toHaveBeenCalledTimes(1);
    expect(mockStartReading).toHaveBeenCalledWith(pin, authenticationUrl);
  });

  it("should render OneIdentityCieCardReaderFailure when the state status is failure", () => {
    jest.spyOn(useCieManagerModule, "useCieManager").mockReturnValue({
      startReading: mockStartReading,
      state: {
        status: "failure",
        failure: { event: "AUTHENTICATION_ERROR", attemptsLeft: 0 }
      }
    });

    const { getByTestId, queryByTestId } = render(
      <OneIdentityCieCardReader
        authenticationUrl={authenticationUrl}
        onAuthorizationUrlReceived={jest.fn()}
        pin={pin}
      />
    );

    const failureElement = getByTestId("mock-failure");
    expect(failureElement.props.failure).toEqual({
      event: "AUTHENTICATION_ERROR",
      attemptsLeft: 0
    });

    expect(queryByTestId("mock-progress")).toBeNull();
  });

  it("should render OneIdentityCieCardReaderProgress for non-failure states, wiring cancel to navigation.goBack", () => {
    const { getByTestId, queryByTestId } = render(
      <OneIdentityCieCardReader
        authenticationUrl={authenticationUrl}
        onAuthorizationUrlReceived={jest.fn()}
        pin={pin}
      />
    );

    const progressElement = getByTestId("mock-progress");
    expect(progressElement.props.state).toEqual({ status: "idle" });
    expect(queryByTestId("mock-failure")).toBeNull();

    fireEvent.press(getByTestId("btn-cancel"));
    expect(mockGoBack).toHaveBeenCalled();
  });

  it("should retry reading with the same pin and authenticationUrl when onRetry is invoked", () => {
    const { getByTestId } = render(
      <OneIdentityCieCardReader
        authenticationUrl={authenticationUrl}
        onAuthorizationUrlReceived={jest.fn()}
        pin={pin}
      />
    );

    mockStartReading.mockClear();

    fireEvent.press(getByTestId("btn-retry"));
    expect(mockStartReading).toHaveBeenCalledWith(pin, authenticationUrl);
  });

  it("should forward onAuthorizationUrlReceived as the useCieManager onSuccess callback", () => {
    const onAuthorizationUrlReceived = jest.fn();

    render(
      <OneIdentityCieCardReader
        authenticationUrl={authenticationUrl}
        onAuthorizationUrlReceived={onAuthorizationUrlReceived}
        pin={pin}
      />
    );

    const { onSuccess } = jest.mocked(useCieManagerModule.useCieManager).mock
      .calls[0][0];
    onSuccess("https://consent.example.com");

    expect(onAuthorizationUrlReceived).toHaveBeenCalledWith(
      "https://consent.example.com"
    );
  });
});
