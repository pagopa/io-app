import React from "react";
import { render, fireEvent } from "@testing-library/react-native";

import CheckboxFormEntry, { CheckboxIDs } from "../CheckboxFormEntry";

describe("CheckboxFormEntry component", () => {
  // eslint-disable-next-line guard-for-in
  for (const id in CheckboxIDs) {
    it(`should call the toggler callback 2 times for ${id}`, () => {
      const mockedToggler = jest.fn();

      const { getByTestId } = render(
        <CheckboxFormEntry
          isChecked={true}
          onToggle={mockedToggler}
          target={id as CheckboxIDs}
        />
      );

      const rawCheckBox = getByTestId("RawCheckbox");
      const label = getByTestId("ContextualHelpCheckboxFormEntryLabel");

      fireEvent.press(rawCheckBox);
      fireEvent.press(label);

      expect(mockedToggler).toBeCalledTimes(2);
    });
  }
});
