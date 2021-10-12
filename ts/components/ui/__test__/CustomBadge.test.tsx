import { render } from "@testing-library/react-native";
import React from "react";
import CustomBadge, { customBadgeTestable } from "../CustomBadge";

const textId = "badgeTestID";
describe("CustomBadge component", () => {
  it(`should be defined for 1 as badge value`, () => {
    const component = render(<CustomBadge badgeValue={1} />).queryByTestId(
      textId
    );
    expect(component).toBeDefined();
  });

  it(`should be not defined for 0 as badge value`, () => {
    const component = render(<CustomBadge badgeValue={0} />).queryByTestId(
      textId
    );
    expect(component).toBeNull();
  });

  it(`should be not defined for undefined as badge value`, () => {
    const component = render(
      <CustomBadge badgeValue={undefined} />
    ).queryByTestId(textId);
    expect(component).toBeNull();
  });

  it(`should have a specific with for 1 digits`, () => {
    const digits = [1, 10, 50, 80, 99, 100, 200, 1000];
    digits.forEach(digit => {
      const component = render(
        <CustomBadge badgeValue={digit} />
      ).queryByTestId(textId);

      expect(component).toBeDefined();
      if (component) {
        expect(component).toHaveStyle({
          width:
            customBadgeTestable!.styles.badgeStyle.width *
            customBadgeTestable!.getWidthMultiplier(digit.toString())
        });
      }
    });
  });
});
