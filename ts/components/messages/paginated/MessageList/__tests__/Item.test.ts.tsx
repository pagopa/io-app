import React from "react";
import { fireEvent, render } from "@testing-library/react-native";

import { MessageCategory } from "../../../../../../definitions/backend/MessageCategory";
import { successReloadMessagesPayload } from "../../../../../__mocks__/messages";
import Item from "../Item";

jest.useFakeTimers();

const messages = successReloadMessagesPayload.messages;

const defaultProps: React.ComponentProps<typeof Item> = {
  category: { tag: "GENERIC" } as MessageCategory,
  hasPaidBadge: false,
  isRead: false,
  isArchived: false,
  isSelected: false,
  isSelectionModeEnabled: false,
  message: messages[0],
  onLongPress: jest.fn(),
  onPress: jest.fn()
};

describe("MessageList Item component", () => {
  describe("with all the flags set to false", () => {
    it("should match the snapshot", () => {
      const component = render(<Item {...defaultProps} />);
      expect(component.toJSON()).toMatchSnapshot();
    });
  });

  describe("when `hasPaidBadge` is true", () => {
    it("should match the snapshot", () => {
      expect(
        render(<Item {...defaultProps} hasPaidBadge={true} />).toJSON()
      ).toMatchSnapshot();
    });
  });

  describe("when `isRead` is true", () => {
    it("should match the snapshot", () => {
      expect(
        render(<Item {...defaultProps} isRead={true} />).toJSON()
      ).toMatchSnapshot();
    });
  });

  describe("when a EU_CODIV_CERT is present", () => {
    it("should match the snapshot", () => {
      expect(
        render(
          <Item
            {...defaultProps}
            category={{ tag: "EU_COVID_CERT" } as MessageCategory}
          />
        ).toJSON()
      ).toMatchSnapshot();
    });
  });

  describe("when `isSelectionModeEnabled` is true", () => {
    describe("and `isSelected` is false", () => {
      it("should match the snapshot", () => {
        expect(
          render(
            <Item {...defaultProps} isSelectionModeEnabled={true} />
          ).toJSON()
        ).toMatchSnapshot();
      });
    });
    describe("and `isSelected` is true", () => {
      it("should match the snapshot", () => {
        expect(
          render(
            <Item
              {...defaultProps}
              isSelectionModeEnabled={true}
              isSelected={true}
            />
          ).toJSON()
        ).toMatchSnapshot();
      });
    });
  });

  describe("when the user taps on the item", () => {
    it("should call only the `onPress` callback", () => {
      const onPress = jest.fn();
      const onLongPress = jest.fn();
      const component = render(
        <Item {...defaultProps} onPress={onPress} onLongPress={onLongPress} />
      );
      fireEvent(component.getByText(defaultProps.message.title), "onPress");
      expect(onPress).toHaveBeenCalledTimes(1);
      expect(onLongPress).not.toHaveBeenCalled();
    });
  });

  describe("when the user long-presses the item", () => {
    it("should call only the `onLongPress` callback", () => {
      const onPress = jest.fn();
      const onLongPress = jest.fn();
      const component = render(
        <Item {...defaultProps} onPress={onPress} onLongPress={onLongPress} />
      );
      fireEvent(component.getByText(defaultProps.message.title), "onLongPress");
      expect(onPress).not.toHaveBeenCalled();
      expect(onLongPress).toHaveBeenCalledTimes(1);
    });
  });
});
