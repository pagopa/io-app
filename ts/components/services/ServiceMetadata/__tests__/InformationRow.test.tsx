import React from "react";
import { render } from "@testing-library/react-native";
import { constNull } from "fp-ts/lib/function";

import InformationRow from "../InformationRow";

describe("the InformationRow component", () => {
  it("should match the snapshot", () => {
    expect(
      render(
        <InformationRow
          value={"via Roma"}
          label={"serviceDetail.fiscalCode"}
          onPress={constNull}
          accessibilityLabel="Label"
        />
      ).toJSON()
    ).toMatchSnapshot();
  });
});
