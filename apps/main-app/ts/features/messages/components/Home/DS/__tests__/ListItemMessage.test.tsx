import { fireEvent, render } from "@testing-library/react-native";
import { Presets } from "react-native-pulsar";

import { ListItemMessage } from "../ListItemMessage";

describe("ListItemMessage", () => {
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

  it("should keep the checkbox when the selection of the same message changes", () => {
    const { getByTestId, rerender } = render(
      <ListItemMessage {...checkboxTestProps} messageId="m1" selected={false} />
    );
    const checkbox = getByTestId("MessageCheckboxInput");

    rerender(
      <ListItemMessage {...checkboxTestProps} messageId="m1" selected={true} />
    );

    expect(getByTestId("MessageCheckboxInput")).toBe(checkbox);
    expect(
      getByTestId("MessageCheckboxInput").props.accessibilityState
    ).toEqual({ checked: true });
  });

  it("should remount the checkbox when a recycled item renders another message", () => {
    const { getByTestId, rerender } = render(
      <ListItemMessage {...checkboxTestProps} messageId="m1" selected={true} />
    );
    const checkbox = getByTestId("MessageCheckboxInput");

    rerender(
      <ListItemMessage {...checkboxTestProps} messageId="m2" selected={false} />
    );

    expect(getByTestId("MessageCheckboxInput")).not.toBe(checkbox);
    expect(
      getByTestId("MessageCheckboxInput").props.accessibilityState
    ).toEqual({ checked: false });
  });
});

const checkboxTestProps = {
  formattedDate: "10/09",
  isRead: true,
  messageTitle: "Message title",
  organizationName: "Organization name",
  serviceName: "Service name"
};
