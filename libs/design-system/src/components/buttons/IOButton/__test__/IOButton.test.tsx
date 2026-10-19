import { render } from "@testing-library/react-native";
import { Alert, StyleSheet } from "react-native";
import Animated from "react-native-reanimated";

import { IOButton } from "../IOButton";

const onButtonPress = () => {
  Alert.alert("Alert", "Action triggered");
};

describe("Test Buttons Components", () => {
  it.each([
    { variant: "link" as const, borderRadius: 0 },
    { variant: "solid" as const, borderRadius: 8 },
    { variant: "outline" as const, borderRadius: 8 }
  ])(
    "IOButton $variant has border radius $borderRadius",
    ({ variant, borderRadius }) => {
      const { getByTestId } = render(
        <IOButton
          icon="inbox"
          label="label"
          onPress={onButtonPress}
          testID="button"
          variant={variant}
        />
      );

      const button = getByTestId("button").findByType(Animated.View);
      expect(StyleSheet.flatten(button.props.style)).toEqual(
        expect.objectContaining({ borderRadius })
      );
    }
  );

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
