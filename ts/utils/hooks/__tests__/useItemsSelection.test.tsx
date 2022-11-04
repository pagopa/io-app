import { fireEvent, render } from "@testing-library/react-native";
import * as O from "fp-ts/lib/Option";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { pipe } from "fp-ts/lib/function";
import { useItemsSelection } from "../useItemsSelection";

const TestContainer = ({
  toToggle = "x",
  toSetAll = []
}: {
  toToggle?: string;
  toSetAll?: Array<string>;
}) => {
  const { selectedItems, toggleItem, setAllItems, resetSelection } =
    useItemsSelection();
  return (
    <View>
      {/* Test initial value */}
      {O.isNone(selectedItems) && <Text>{"Selection not active"}</Text>}

      {/* Test content of the Set at any given time */}
      <View>
        {pipe(
          selectedItems,
          O.map(_ => Array.from(_)),
          O.map(res => res.map(id => <Text key={id}>{id}</Text>)),
          O.getOrElseW(() => [])
        )}
      </View>

      {/* Test toggle function */}
      <TouchableOpacity
        onPress={() => toggleItem(toToggle)}
        testID={"toggle"}
      />

      {/* Test set all function */}
      <TouchableOpacity
        onPress={() => setAllItems(toSetAll)}
        testID={"set-all"}
      />

      {/* Test reset function */}
      <TouchableOpacity onPress={() => resetSelection()} testID={"reset"} />
    </View>
  );
};

describe("the useItemsSelection hook ", () => {
  it("should initialize the state to `none`", () => {
    const { getByText } = render(<TestContainer />);
    expect(getByText("Selection not active")).toBeDefined();
  });

  describe("when `resetSelection` is called", () => {
    it("should reset the state", () => {
      const { getByText, getByTestId } = render(
        <TestContainer toToggle={"x"} />
      );
      fireEvent(getByTestId("toggle"), "onPress");
      fireEvent(getByTestId("reset"), "onPress");
      expect(getByText("Selection not active")).toBeDefined();
    });
  });

  describe("when `toggleItem` is called", () => {
    it("should add a new item to an empty set", () => {
      const { getByText, getByTestId } = render(
        <TestContainer toToggle={"x"} />
      );
      fireEvent(getByTestId("toggle"), "onPress");
      expect(getByText("x")).toBeDefined();
    });

    it("removes an existing item", () => {
      const { queryByText, getByTestId } = render(
        <TestContainer toToggle={"x"} />
      );
      fireEvent(getByTestId("toggle"), "onPress");
      fireEvent(getByTestId("toggle"), "onPress");
      expect(queryByText("x")).toBeNull();
    });
  });

  describe("when `setAllItems` is called", () => {
    describe("and the state is pristine", () => {
      it("should add selected items", () => {
        const { getByText, getByTestId } = render(
          <TestContainer toSetAll={["a", "b", "c"]} />
        );
        fireEvent(getByTestId("set-all"), "onPress");
        expect(getByText("a")).toBeDefined();
        expect(getByText("b")).toBeDefined();
        expect(getByText("c")).toBeDefined();
      });
    });

    describe("and the state contains other items", () => {
      it("should add only the selected and remove the existing ones", () => {
        const { getByText, queryByText, getByTestId } = render(
          <TestContainer toToggle={"x"} toSetAll={["a", "b", "c"]} />
        );
        fireEvent(getByTestId("toggle"), "onPress");
        fireEvent(getByTestId("set-all"), "onPress");
        expect(getByText("a")).toBeDefined();
        expect(getByText("b")).toBeDefined();
        expect(getByText("c")).toBeDefined();
        expect(queryByText("x")).toBeNull();
      });
    });
  });
});
