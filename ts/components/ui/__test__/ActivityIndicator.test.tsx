import TestRenderer from "react-test-renderer";
import React from "react";
import ActivityIndicator from "../ActivityIndicator";

describe("ActivityIndicator", () => {
  it("should match the snapshot with default props", () => {
    expect(TestRenderer.create(<ActivityIndicator />)).toMatchSnapshot();
  });
});
