import {
  Body,
  IOButton,
  H2,
  IOColors,
  VSpacer,
  useIOTheme
} from "@pagopa/io-app-design-system";
import { Alert, View } from "react-native";
import { IOScrollView } from "../../../components/ui/IOScrollView";

export const DSIOScrollView = () => {
  const theme = useIOTheme();

  return (
    <IOScrollView
      debugMode
      actions={{
        type: "ThreeButtons",
        primary: {
          label: "Primary action",
          onPress: () => Alert.alert("Primary action pressed! (⁠⁠ꈍ⁠ᴗ⁠ꈍ⁠)")
        },
        secondary: {
          label: "Secondary action",
          onPress: () => Alert.alert("Secondary action pressed! (⁠⁠ꈍ⁠ᴗ⁠ꈍ⁠)")
        },
        tertiary: {
          label: "Tertiary action",
          onPress: () => Alert.alert("Tertiary action pressed! (⁠⁠ꈍ⁠ᴗ⁠ꈍ⁠)")
        }
      }}
    >
      <H2 color={theme["textHeading-default"]}>Start</H2>
      {[...Array(50)].map((_el, i) => (
        <Body key={`body-${i}`}>Repeated text</Body>
      ))}
      <VSpacer />
      <View
        style={{
          width: "100%",
          aspectRatio: 16 / 9,
          borderRadius: 32,
          backgroundColor: IOColors["blueIO-850"]
        }}
      />
      <VSpacer />
      <IOButton
        variant="outline"
        label="Test"
        onPress={() => Alert.alert("Test button")}
      />
      {[...Array(2)].map((_el, i) => (
        <Body key={`body-${i}`}>Repeated text</Body>
      ))}
      <H2 color={theme["textHeading-default"]}>End</H2>
    </IOScrollView>
  );
};
