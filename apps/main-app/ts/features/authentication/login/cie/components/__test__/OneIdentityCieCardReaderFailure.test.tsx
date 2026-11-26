import { render, screen } from "@testing-library/react-native";

import {
  CieSdkEvent,
  LoginFailure
} from "../../../../common/utils/loginFailure";
import { OneIdentityCieCardReaderFailure } from "../OneIdentityCieCardReaderFailure";

const cieCardFailure = (
  event: CieSdkEvent,
  attemptsLeft: number
): LoginFailure => ({ kind: "cieCard", details: { attemptsLeft, event } });

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
  it.each<[CieSdkEvent, string]>([
    ["Function not supported", "CieWrongCardScreen"],
    ["ON_TAG_DISCOVERED_NOT_CIE", "CieWrongCardScreen"],
    ["TAG_ERROR_NFC_NOT_SUPPORTED", "CieWrongCardScreen"],
    ["AUTHENTICATION_ERROR", "CieUnexpectedErrorScreen"],
    ["ON_NO_INTERNET_CONNECTION", "CieUnexpectedErrorScreen"],
    ["CERTIFICATE_EXPIRED", "CieExpiredOrInvalidScreen"],
    ["CERTIFICATE_REVOKED", "CieExpiredOrInvalidScreen"],
    ["EXTENDED_APDU_NOT_SUPPORTED", "CieExtendedApduNotSupportedScreen"]
  ])(
    "should render the expected screen when failure.event is %s",
    (event, expectedTestId) => {
      render(
        <OneIdentityCieCardReaderFailure failure={cieCardFailure(event, 0)} />
      );
      expect(screen.getByTestId(expectedTestId)).toBeTruthy();
    }
  );

  it("should render CieWrongPin with remainingCount 0 when the card pin is locked", () => {
    render(
      <OneIdentityCieCardReaderFailure
        failure={cieCardFailure("ON_CARD_PIN_LOCKED", 3)}
      />
    );
    const wrongPinElement = screen.getByTestId("CieWrongPin");
    expect(wrongPinElement.props.remainingCount).toBe(0);
  });

  it.each<CieSdkEvent>(["ON_PIN_ERROR", "PIN Locked"])(
    "should render CieWrongPin with the failure's attemptsLeft when failure.event is %s",
    event => {
      render(
        <OneIdentityCieCardReaderFailure failure={cieCardFailure(event, 2)} />
      );
      const wrongPinElement = screen.getByTestId("CieWrongPin");
      expect(wrongPinElement.props.remainingCount).toBe(2);
    }
  );

  it.each<{ event: CieSdkEvent; name: string }>([
    { name: "a wrong PIN", event: "ON_PIN_ERROR" },
    { name: "a wrong card", event: "ON_TAG_DISCOVERED_NOT_CIE" },
    { name: "an expired card", event: "CERTIFICATE_EXPIRED" },
    { name: "an unhandled event", event: "Transmission Error" }
  ])("should set the failure event as debug data on $name", ({ event }) => {
    const failure = cieCardFailure(event, 1);

    render(<OneIdentityCieCardReaderFailure failure={failure} />);

    expect(mockUseDebugInfo).toHaveBeenLastCalledWith({ failure });
  });

  it.each<{ failure: LoginFailure; name: string }>([
    {
      name: "an unhandled failure event",
      failure: cieCardFailure("Transmission Error", 0)
    },
    {
      name: "a failure that is not of the CIE card",
      failure: { kind: "keyGeneration", details: {} }
    }
  ])("should render nothing for $name", ({ failure }) => {
    const { toJSON } = render(
      <OneIdentityCieCardReaderFailure failure={failure} />
    );
    expect(toJSON()).toBeNull();
  });
});
