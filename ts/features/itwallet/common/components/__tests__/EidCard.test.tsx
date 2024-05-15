import { render } from "@testing-library/react-native";
import * as React from "react";
import { EIdCard, EIdStatus } from "../EIdCard";

describe("EIdCard", () => {
  it.each(["valid", "expired", "pending"] as ReadonlyArray<EIdStatus>)(
    "should match snapshot when status is %p",
    status => {
      const component = render(
        <EIdCard
          fiscalCode="AAAAAA99A99A999A"
          name="ABCDEFG ABCDEFG"
          status={status}
        />
      );
      expect(component).toMatchSnapshot();
    }
  );
});
