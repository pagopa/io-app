// tslint:disable-next-line:no-implicit-dependencies
import renderer from "react-test-renderer";

import * as React from "react";

import App from "../App";

describe("App", () => {
  it("should render home screen", () => {
    const tree = renderer.create(<App />).toJSON();
    expect(tree).not.toBeNull();
  });
});
