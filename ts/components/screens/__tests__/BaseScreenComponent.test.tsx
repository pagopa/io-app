import { render } from "@testing-library/react-native";
import React from "react";

import BaseScreenComponent from "../BaseScreenComponent";

describe("Non Regression Rendering Tests", () => {
  test("Renders With Primary Color", () => {
    const myObj = render(
      <BaseScreenComponent
        goBack={false}
        headerTitle="My Header"
        contextualHelpMarkdown={undefined}
        primary={true}
      />
    );
    myObj.debug();
  });
});
