import { render } from "@testing-library/react-native";
import * as React from "react";
import { EidCard, EidStatus } from "../EidCard";

describe("EidCard", () => {
  it.each(["valid", "expired", "pending"] as ReadonlyArray<EidStatus>)(
    "should match snapshot when status is %p",
    status => {
      const component = render(
        <EidCard
          fiscalCode="AAAAAA99A99A999A"
          name="ABCDEFG ABCDEFG"
          status={status}
        />
      );
      expect(component).toMatchSnapshot();
    }
  );
});
