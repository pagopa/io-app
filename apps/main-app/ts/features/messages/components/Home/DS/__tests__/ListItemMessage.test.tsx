import { fireEvent, render } from "@testing-library/react-native";
import I18n from "i18next";
import { Presets } from "react-native-pulsar";

import * as platform from "../../../../../../utils/platform";
import { ListItemMessage } from "../ListItemMessage";

describe("ListItemMessage", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should trigger a light haptic feedback and call onPress when pressed", () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <ListItemMessage
        formattedDate="10/09"
        isRead={false}
        messageTitle="Message title"
        onPress={onPress}
        organizationName="Organization name"
        serviceName="Service name"
        testID="list_item_message"
      />
    );

    fireEvent.press(getByTestId("list_item_message"));

    expect(Presets.System.impactLight).toHaveBeenCalledTimes(1);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test.each([
    { name: "Android selection", isAndroid: true, selected: false },
    { name: "Android deselection", isAndroid: true, selected: true },
    { name: "iOS selection", isAndroid: false, selected: false },
    { name: "iOS deselection", isAndroid: false, selected: true }
  ])(
    "should expose and handle the accessibility action for $name",
    ({ isAndroid, selected }) => {
      jest.replaceProperty(platform, "isAndroid", isAndroid);
      const onLongPress = jest.fn();
      const onPress = jest.fn();
      const { getByTestId } = render(
        <ListItemMessage
          formattedDate="10/09"
          isRead={false}
          messageTitle="Message title"
          onLongPress={onLongPress}
          onPress={onPress}
          organizationName="Organization name"
          selected={selected}
          serviceName="Service name"
          testID="list_item_message"
        />
      );
      const item = getByTestId("list_item_message");

      const label = I18n.t(
        selected
          ? "messages.accessibility.message.deselectAction"
          : "messages.accessibility.message.selectAction"
      );
      const actionName = isAndroid ? "longpress" : label;
      expect(item.props.accessibilityActions).toEqual([
        { name: actionName, label }
      ]);
      fireEvent(item, "accessibilityAction", {
        nativeEvent: { actionName }
      });
      expect(onLongPress).toHaveBeenCalledTimes(1);
      expect(onPress).not.toHaveBeenCalled();

      fireEvent(item, "accessibilityAction", {
        nativeEvent: { actionName: "unknown" }
      });
      expect(onLongPress).toHaveBeenCalledTimes(1);
      expect(onPress).not.toHaveBeenCalled();

      fireEvent(item, "longPress");
      expect(onLongPress).toHaveBeenCalledTimes(2);
      fireEvent.press(item);
      expect(onPress).toHaveBeenCalledTimes(1);
    }
  );

  test.each([
    { name: "Android", isAndroid: true },
    { name: "iOS", isAndroid: false }
  ])(
    "should not expose a long-press action without a handler on $name",
    ({ isAndroid }) => {
      jest.replaceProperty(platform, "isAndroid", isAndroid);
      const { getByTestId } = render(
        <ListItemMessage
          formattedDate="10/09"
          isRead={false}
          messageTitle="Message title"
          organizationName="Organization name"
          serviceName="Service name"
          testID="list_item_message"
        />
      );

      const item = getByTestId("list_item_message");
      expect(item.props.accessibilityActions).toBeUndefined();
      expect(item.props.onAccessibilityAction).toBeUndefined();
    }
  );
});
