import { render } from "@testing-library/react-native";
import * as React from "react";
import { CgnCard } from "../CgnCard";

describe("CgnCard", () => {
  it("should match the snapshot", () => {
    const component = render(<CgnCard expireDate={new Date(2023, 11, 2)} />);
    expect(component).toMatchSnapshot();
  });
});
