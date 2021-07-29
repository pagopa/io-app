import { render } from "@testing-library/react-native";
import * as React from "react";
import InternationalCircuitIconsBar from "../InternationalCircuitIconsBar";

describe("InternationalCircuitIconBar component", () => {
  ["maestro", "mastercard", "visa", "visaElectron", "vPay"].forEach(circuit =>
    it(`should show the ${circuit} icon`, () => {
      const component = render(<InternationalCircuitIconsBar />);

      expect(component.queryByTestId(circuit)).not.toBeNull();
    })
  );
});
