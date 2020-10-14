import React from "react";
import TestRenderer from "react-test-renderer";

import { RadioButtonList } from "../RadioButtonList";

const items = [
  {
    label: "foo",
    id: 1
  }
];
const onPress = selected => {};
const radioButtonListRendered = TestRenderer.create(
  <RadioButtonList items={items} />
);
