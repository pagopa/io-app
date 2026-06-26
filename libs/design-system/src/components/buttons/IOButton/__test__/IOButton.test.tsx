import { Alert } from "react-native";
import { render } from "@testing-library/react-native";
import { IOButton } from "../IOButton";

const onButtonPress = () => {
  Alert.alert("Alert", "Action triggered");
};

describe("Test Buttons Components", () => {
  it("IOButton Snapshot · Solid variant", () => {
    const { toJSON } = render(
      <IOButton
        variant="solid"
        label={"label"}
        accessibilityLabel={"accessibilityLabel"}
        onPress={onButtonPress}
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it("IOButton Snapshot · Link variant", () => {
    const { toJSON } = render(
      <IOButton
        variant="link"
        label={"label"}
        accessibilityLabel={"accessibilityLabel"}
        onPress={onButtonPress}
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it("IOButton Snapshot · Outline variant", () => {
    const { toJSON } = render(
      <IOButton
        variant="outline"
        label={"label"}
        accessibilityLabel={"accessibilityLabel"}
        onPress={onButtonPress}
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
