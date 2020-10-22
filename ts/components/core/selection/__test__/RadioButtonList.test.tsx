import React from "react";

import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import { RadioButtonList } from "../RadioButtonList";

const items = [
  {
    label: "foo",
    id: 0
  },
  {
    label: "bar",
    id: 1
  }
];
const onPressHandler = () => 1;

describe("Test RadioButtonList componet", () => {
  it("Expected to be rendered", () => {
    render(<RadioButtonList items={items} onPress={onPressHandler} />);

    screen.
  });
});
