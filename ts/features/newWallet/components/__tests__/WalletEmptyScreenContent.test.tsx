import React from "react";
import { render } from "@testing-library/react-native";
import { WalletEmptyScreenContent } from "../WalletEmptyScreenContent";

describe("WalletEmptyScreenContent", () => {
  it("should match the snapshot", () => {
    const component = render(<WalletEmptyScreenContent />);
    expect(component.toJSON()).toMatchSnapshot();
  });
});
