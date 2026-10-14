import { Event as CEvent } from "@pagopa/react-native-cie";
import { render, screen } from "@testing-library/react-native";

import { OneIdentityCieCardReaderFailure } from "../OneIdentityCieCardReaderFailure";

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
  it.each<[CEvent["event"], string]>([
    [
      "Function not supported" as unknown as CEvent["event"],
      "CieWrongCardScreen"
    ],
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
        <OneIdentityCieCardReaderFailure
          failure={{ event, attemptsLeft: 0 } as unknown as CEvent}
        />
      );
      expect(screen.getByTestId(expectedTestId)).toBeTruthy();
    }
  );

  it("should render CieWrongPin with remainingCount 0 when the card pin is locked", () => {
    render(
      <OneIdentityCieCardReaderFailure
        failure={
          { event: "ON_CARD_PIN_LOCKED", attemptsLeft: 3 } as unknown as CEvent
        }
      />
    );
    const wrongPinElement = screen.getByTestId("CieWrongPin");
    expect(wrongPinElement.props.remainingCount).toBe(0);
  });

  it.each<CEvent["event"]>(["ON_PIN_ERROR", "PIN Locked"])(
    "should render CieWrongPin with the failure's attemptsLeft when failure.event is %s",
    event => {
      render(
        <OneIdentityCieCardReaderFailure
          failure={{ event, attemptsLeft: 2 } as unknown as CEvent}
        />
      );
      const wrongPinElement = screen.getByTestId("CieWrongPin");
      expect(wrongPinElement.props.remainingCount).toBe(2);
    }
  );

  it("should render nothing for an unhandled failure event", () => {
    const { toJSON } = render(
      <OneIdentityCieCardReaderFailure
        failure={
          { event: "Transmission Error", attemptsLeft: 0 } as unknown as CEvent
        }
      />
    );
    expect(toJSON()).toBeNull();
  });
});
