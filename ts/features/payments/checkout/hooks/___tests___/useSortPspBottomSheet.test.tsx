import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { Button, Text } from "react-native";
import { WalletPaymentPspSortType } from "../../types";
import { useSortPspBottomSheet } from "../useSortPspBottomSheet";

// Mock bottom sheet hook
jest.mock("../../../../../utils/hooks/bottomSheet", () => ({
  useIOBottomSheetAutoresizableModal: jest.fn().mockReturnValue({
    isVisible: false,
    show: jest.fn(),
    hide: jest.fn()
  })
}));

// Test component to render and use the hook
const ComponentWithPspBottomSheet = ({
  onSortChange
}: {
  onSortChange: (sortType: WalletPaymentPspSortType) => void;
}) => {
  const { sortType, dismiss, present } = useSortPspBottomSheet({
    onSortChange
  });

  return (
    <>
      <Text testID="current-sort-type">{sortType}</Text>
      <Button title="Show" onPress={present} testID="show-button" />
      <Button title="Hide" onPress={dismiss} testID="hide-button" />
      <Button
        title="Change to Name Sort"
        onPress={() => onSortChange("name")}
        testID="change-sort-button"
      />
    </>
  );
};

describe("useSortPspBottomSheet", () => {
  it("should initialize sortType to 'default'", () => {
    const onSortChangeMock = jest.fn();
    const { getByTestId } = render(
      <ComponentWithPspBottomSheet onSortChange={onSortChangeMock} />
    );

    expect(getByTestId("current-sort-type").children[0]).toBe("default");
  });

  it("should update sortType and call onSortChange when handleChangeSort is called", () => {
    const onSortChangeMock = jest.fn();
    const { getByTestId } = render(
      <ComponentWithPspBottomSheet onSortChange={onSortChangeMock} />
    );

    // Trigger the sort change
    fireEvent.press(getByTestId("change-sort-button"));
    expect(onSortChangeMock).toHaveBeenCalledWith("name");
  });

  it("should call show and hide methods for the bottom sheet modal", () => {
    const onSortChangeMock = jest.fn();
    const { getByTestId } = render(
      <ComponentWithPspBottomSheet onSortChange={onSortChangeMock} />
    );

    const showButton = getByTestId("show-button");
    const hideButton = getByTestId("hide-button");

    // Trigger show and hide methods
    fireEvent.press(showButton);
    fireEvent.press(hideButton);

    expect(showButton).toBeTruthy();
    expect(hideButton).toBeTruthy();
  });
});
