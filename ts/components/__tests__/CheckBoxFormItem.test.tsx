import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { CheckBoxFormItem, CheckboxIDs } from "../SendSupportRequestOptions";

describe("Checkbox+Label component for the SendSupportRequestOptions form", () => {
  // We don't really need a guard-for-in here
  // eslint-disable-next-line
  for (const id in CheckboxIDs) {
    it(`should call the toggler callback 2 times for ${id}`, () => {
      const mockedToggler = jest.fn();

      const { getByTestId } = render(
        <CheckBoxFormItem
          isChecked={true}
          onToggle={mockedToggler}
          target={id as CheckboxIDs}
        />
      );

      const rawCheckBox = getByTestId("RawCheckbox");
      const label = getByTestId("CheckboxFormItemLabel");

      fireEvent.press(rawCheckBox);
      fireEvent.press(label);

      expect(mockedToggler).toBeCalledTimes(2);
    });
  }
});
