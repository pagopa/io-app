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
});
