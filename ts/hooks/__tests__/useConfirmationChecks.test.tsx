import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useConfirmationChecks } from "../useConfirmationChecks";

const UNFULLFILLED_CHECK_TEST = "Unfullfilled checks";
const FULLFILLED_CHECK_TEST = "Fullfilled checks";

describe("useConfirmationChecks", () => {
  test("should start with unfullfilled checks", () => {
    const { getByText } = render(<TestComponent />);
    expect(getByText(UNFULLFILLED_CHECK_TEST)).toBeDefined();
  });

  test("should return unfullfilled checks with only some checks toggled", () => {
    const { getByText, getByTestId } = render(<TestComponent />);
    fireEvent(getByTestId("check0"), "onPress");
    expect(getByText(UNFULLFILLED_CHECK_TEST)).toBeDefined();
  });

  test("should return fullfilled checks with all checks toggled", () => {
    const { getByText, getByTestId } = render(<TestComponent />);
    fireEvent(getByTestId("check0"), "onPress");
    fireEvent(getByTestId("check1"), "onPress");
    fireEvent(getByTestId("check2"), "onPress");
    expect(getByText(FULLFILLED_CHECK_TEST)).toBeDefined();
  });
});

const TestComponent = () => {
  const checks = useConfirmationChecks(3);

  return (
    <View>
      {!checks.areFulfilled && <Text>{UNFULLFILLED_CHECK_TEST}</Text>}
      {checks.areFulfilled && <Text>{FULLFILLED_CHECK_TEST}</Text>}
      <TouchableOpacity
        onPress={() => checks.setValue(0, true)}
        testID={`check0`}
      />
      <TouchableOpacity
        onPress={() => checks.setValue(1, true)}
        testID={`check1`}
      />
      <TouchableOpacity
        onPress={() => checks.setValue(2, true)}
        testID={`check2`}
      />
    </View>
  );
};
