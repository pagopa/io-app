import TestRenderer from "react-test-renderer";
import React from "react";
import ActivityIndicator from "../ActivityIndicator";

describe("ActivityIndicator", () => {
  it("Freeze 'ActivityIndicator' state", () => {
    expect(TestRenderer.create(<ActivityIndicator />)).toMatchSnapshot();
  });
});
