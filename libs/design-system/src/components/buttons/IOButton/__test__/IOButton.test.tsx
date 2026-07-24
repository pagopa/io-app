import { render } from "@testing-library/react-native";
import { Alert } from "react-native";

import { IOButton } from "../IOButton";

const onButtonPress = () => {
  Alert.alert("Alert", "Action triggered");
};

describe("Test Buttons Components", () => {
  it("IOButton Snapshot · Solid variant", () => {
    const { toJSON } = render(
      <IOButton
        accessibilityLabel={"accessibilityLabel"}
        label={"label"}
        onPress={onButtonPress}
        variant="solid"
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it("IOButton Snapshot · Link variant", () => {
    const { toJSON } = render(
      <IOButton
        accessibilityLabel={"accessibilityLabel"}
        label={"label"}
        onPress={onButtonPress}
        variant="link"
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it("IOButton Snapshot · Outline variant", () => {
    const { toJSON } = render(
      <IOButton
        accessibilityLabel={"accessibilityLabel"}
        label={"label"}
        onPress={onButtonPress}
        variant="outline"
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
