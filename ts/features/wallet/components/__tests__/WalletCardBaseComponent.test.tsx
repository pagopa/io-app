import { H3 } from "@pagopa/io-app-design-system";
import { render } from "@testing-library/react-native";
import React from "react";
import { withWalletCardBaseComponent } from "../WalletCardBaseComponent";

jest.mock("react-native-reanimated", () => ({
  ...require("react-native-reanimated/mock"),
  Layout: {
    duration: jest.fn()
  }
}));

describe("WalletCardBaseComponent", () => {
  it("should render the card content correctly", () => {
    const innerComponent = () => <H3>Hello!</H3>;
    const { queryByText } = render(
      withWalletCardBaseComponent(innerComponent)({
        cardProps: {},
        isStacked: false
      })
    );
    expect(queryByText("Hello!")).not.toBeNull();
  });
});
