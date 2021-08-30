import { render } from "@testing-library/react-native";
import React from "react";
import WebviewComponent from "../WebviewComponent";

describe("WebviewComponent tests", () => {
  it("snapshot for component", () => {
    const component = render(
      <WebviewComponent source={{ uri: "https://google.com" }} />
    );
    expect(component).toMatchSnapshot();
  });
});
