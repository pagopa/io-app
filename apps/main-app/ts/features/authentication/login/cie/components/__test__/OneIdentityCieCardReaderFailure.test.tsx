import type { NfcError } from "@io-app/expo-cie";

import { render, screen } from "@testing-library/react-native";
import I18n from "i18next";

import { OneIdentityCieCardReaderFailure } from "../OneIdentityCieCardReaderFailure";
import { OneIdentityCieCardReaderProgressContentProps } from "../OneIdentityCieCardReaderProgressContent";

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

jest.mock("../OneIdentityCieCardReaderProgressContent", () => ({
  OneIdentityCieCardReaderProgressContent: (props: Record<string, unknown>) => {
    const React = require("react");
    const { View } = require("react-native");
    return React.createElement(View, {
      testID: "ProgressContent",
      ...props
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

const actions = {
  onCancel: jest.fn(),
  onRetry: jest.fn()
};

describe("OneIdentityCieCardReaderFailure", () => {
  it.each<[NfcError["name"], string]>([
    ["NOT_A_CIE", "CieWrongCardScreen"],
    ["AUTHENTICATION_ERROR", "CieUnexpectedErrorScreen"],
    ["GENERIC_ERROR", "CieUnexpectedErrorScreen"],
    ["NO_INTERNET_CONNECTION", "CieUnexpectedErrorScreen"],
    ["CERTIFICATE_EXPIRED", "CieExpiredOrInvalidScreen"],
    ["CERTIFICATE_REVOKED", "CieExpiredOrInvalidScreen"],
    ["APDU_ERROR", "CieExtendedApduNotSupportedScreen"]
  ])(
    "should render the expected screen when failure.name is %s",
    (event, expectedTestId) => {
      render(
        <OneIdentityCieCardReaderFailure
          failure={{ name: event } as NfcError}
          {...actions}
        />
      );
      expect(screen.getByTestId(expectedTestId)).toBeTruthy();
    }
  );

  it("should render CieWrongPin with remainingCount 0 when the card pin is blocked", () => {
    render(
      <OneIdentityCieCardReaderFailure
        failure={{ name: "CARD_BLOCKED" }}
        {...actions}
      />
    );
    const wrongPinElement = screen.getByTestId("CieWrongPin");
    expect(wrongPinElement.props.remainingCount).toBe(0);
  });

  it("should render CieWrongPin with the failure's attemptsLeft when the PIN is wrong", () => {
    render(
      <OneIdentityCieCardReaderFailure
        failure={{ name: "WRONG_PIN", attemptsLeft: 2 }}
        {...actions}
      />
    );
    const wrongPinElement = screen.getByTestId("CieWrongPin");
    expect(wrongPinElement.props.remainingCount).toBe(2);
  });

  it.each<{ failure: NfcError; name: string }>([
    { name: "a wrong PIN", failure: { name: "WRONG_PIN", attemptsLeft: 1 } },
    { name: "a wrong card", failure: { name: "NOT_A_CIE" } },
    { name: "an expired card", failure: { name: "CERTIFICATE_EXPIRED" } },
    { name: "a lost tag", failure: { name: "TAG_LOST" } }
  ])("should set the failure event as debug data on $name", ({ failure }) => {
    render(<OneIdentityCieCardReaderFailure failure={failure} {...actions} />);

    expect(mockUseDebugInfo).toHaveBeenLastCalledWith({ failure });
  });

  it("should render the card-lost copy when the tag is lost", () => {
    render(
      <OneIdentityCieCardReaderFailure
        failure={{ name: "TAG_LOST" }}
        {...actions}
      />
    );

    const props = screen.getByTestId("ProgressContent")
      .props as OneIdentityCieCardReaderProgressContentProps;

    expect(props.status).toBe("error");
    expect(props.title).toBe(
      I18n.t("authentication.cie.card.error.readerCardLostTitle")
    );
    expect(props.primaryAction?.onPress).toBe(actions.onRetry);
    expect(props.secondaryAction?.onPress).toBe(actions.onCancel);
  });

  it.each(["CANCELLED_BY_USER", "WRONG_CAN"] as const)(
    "should render nothing when the failure is %s",
    name => {
      const { toJSON } = render(
        <OneIdentityCieCardReaderFailure failure={{ name }} {...actions} />
      );

      expect(toJSON()).toBeNull();
    }
  );
});
