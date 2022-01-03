import React from "react";
import { fireEvent, render } from "@testing-library/react-native";

import { MessageCategory } from "../../../../../../definitions/backend/MessageCategory";
import { successReloadMessagesPayload } from "../../../../../__mocks__/messages";
import Item from "../Item";
import { TagEnum } from "../../../../../../definitions/backend/MessageCategoryBase";

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

  describe("when `isRead` is true", () => {
    it("should match the snapshot", () => {
      expect(
        render(<Item {...defaultProps} isRead={true} />).toJSON()
      ).toMatchSnapshot();
    });
  });

  describe(`when category is ${TagEnum.LEGAL_MESSAGE}`, () => {
    it("should match the snapshot", () => {
      expect(
        render(
          <Item {...defaultProps} category={{ tag: TagEnum.LEGAL_MESSAGE }} />
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

  const euCovidCertCategory = { tag: "EU_COVID_CERT" } as MessageCategory;
  [
    { isArchived: false, hasPaidBadge: false, category: defaultProps.category },
    { isArchived: true, hasPaidBadge: false, category: defaultProps.category },
    { isArchived: true, hasPaidBadge: true, category: defaultProps.category },
    { isArchived: false, hasPaidBadge: true, category: defaultProps.category },
    // with Green Pass
    { isArchived: false, hasPaidBadge: false, category: euCovidCertCategory },
    { isArchived: true, hasPaidBadge: false, category: euCovidCertCategory },
    { isArchived: true, hasPaidBadge: true, category: euCovidCertCategory },
    { isArchived: false, hasPaidBadge: true, category: euCovidCertCategory }
  ].forEach(testProps => {
    describe(`when isArchived=${testProps.isArchived} hasPaidBadge=${testProps.hasPaidBadge} category=${testProps.category.tag}`, () => {
      it("should match the snapshot", () => {
        expect(
          render(<Item {...defaultProps} {...testProps} />).toJSON()
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
