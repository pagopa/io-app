import type { NfcError } from "@io-app/expo-cie";

import { render, screen } from "@testing-library/react-native";

import { OneIdentityCieCardReaderFailure } from "../OneIdentityCieCardReaderFailure";

const mockUseDebugInfo = jest.fn();
jest.mock("../../../../../../hooks/useDebugInfo", () => ({
  useDebugInfo: (data: unknown) => mockUseDebugInfo(data)
}));

jest.mock("../../screens/CieExpiredOrInvalidScreen", () => ({
  __esModule: true,
  default: () => {
    const React = require("react");
    const { View } = require("react-native");
    return React.createElement(View, {
      testID: "CieExpiredOrInvalidScreen"
    });
  }
}));

jest.mock("../../screens/CieExtendedApduNotSupportedScreen", () => ({
  __esModule: true,
  default: () => {
    const React = require("react");
    const { View } = require("react-native");
    return React.createElement(View, {
      testID: "CieExtendedApduNotSupportedScreen"
    });
  }
}));

jest.mock("../../screens/CieUnexpectedErrorScreen", () => ({
  __esModule: true,
  default: () => {
    const React = require("react");
    const { View } = require("react-native");
    return React.createElement(View, {
      testID: "CieUnexpectedErrorScreen"
    });
  }
}));

jest.mock("../../screens/CieWrongCardScreen", () => ({
  __esModule: true,
  default: () => {
    const React = require("react");
    const { View } = require("react-native");
    return React.createElement(View, {
      testID: "CieWrongCardScreen"
    });
  }
}));

jest.mock("../CieWrongPin", () => ({
  CieWrongPin: (props: { remainingCount: number }) => {
    const React = require("react");
    const { View } = require("react-native");

    const MockView = View as React.FC<{
      remainingCount: number;
      testID: string;
    }>;

    return React.createElement(MockView, {
      testID: "CieWrongPin",
      ...props
    });
  }
}));

describe("OneIdentityCieCardReaderFailure", () => {
  it.each<[NfcError["name"], string]>([
    ["NOT_A_CIE", "CieWrongCardScreen"],
    ["AUTHENTICATION_ERROR", "CieUnexpectedErrorScreen"],
    ["NO_INTERNET_CONNECTION", "CieUnexpectedErrorScreen"],
    ["GENERIC_ERROR", "CieUnexpectedErrorScreen"],
    ["CERTIFICATE_EXPIRED", "CieExpiredOrInvalidScreen"],
    ["CERTIFICATE_REVOKED", "CieExpiredOrInvalidScreen"],
    ["APDU_ERROR", "CieExtendedApduNotSupportedScreen"]
  ])(
    "should render the expected screen when failure.event is %s",
    (event, expectedTestId) => {
      render(
        <OneIdentityCieCardReaderFailure
          failure={{ name: event } as NfcError}
        />
      );
      expect(screen.getByTestId(expectedTestId)).toBeTruthy();
    }
  );

  it("should render CieWrongPin with remainingCount 0 when the card pin is blocked", () => {
    render(
      <OneIdentityCieCardReaderFailure failure={{ name: "CARD_BLOCKED" }} />
    );
    const wrongPinElement = screen.getByTestId("CieWrongPin");
    expect(wrongPinElement.props.remainingCount).toBe(0);
  });

  it("should render CieWrongPin with the failure's attemptsLeft when the PIN is wrong", () => {
    render(
      <OneIdentityCieCardReaderFailure
        failure={{ name: "WRONG_PIN", attemptsLeft: 2 }}
      />
    );
    const wrongPinElement = screen.getByTestId("CieWrongPin");
    expect(wrongPinElement.props.remainingCount).toBe(2);
  });

  it.each<{ event: CEvent["event"]; name: string }>([
    { name: "a wrong PIN", event: "ON_PIN_ERROR" },
    { name: "a wrong card", event: "ON_TAG_DISCOVERED_NOT_CIE" },
    { name: "an expired card", event: "CERTIFICATE_EXPIRED" },
    { name: "an unhandled event", event: "Transmission Error" }
  ])("should set the failure event as debug data on $name", ({ event }) => {
    const failure = { event, attemptsLeft: 1 } as unknown as CEvent;

    render(<OneIdentityCieCardReaderFailure failure={failure} />);

    expect(mockUseDebugInfo).toHaveBeenLastCalledWith({ failure });
  });

  it("should render nothing for an unhandled failure event", () => {
    const { toJSON } = render(
      <OneIdentityCieCardReaderFailure failure={{ name: "TAG_LOST" }} />
    );
    expect(toJSON()).toBeNull();
  });
});
