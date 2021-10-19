import { render } from "@testing-library/react-native";

import React from "react";
import PayPalStartOnboardingScreen from "../PayPalStartOnboardingScreen";

describe("PayPalStartOnboardingScreen", () => {
  jest.useFakeTimers();
  it(`match snapshot`, () => {
    const component = render(<PayPalStartOnboardingScreen />);
    expect(component).toMatchSnapshot();
  });
});
