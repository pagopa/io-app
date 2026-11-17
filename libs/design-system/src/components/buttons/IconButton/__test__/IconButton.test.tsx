import { Alert } from "react-native";

import { renderWithExperimentalEnabledContextProvider } from "../../../../utils/testing";
import { IconButton } from "../IconButton";

const onButtonPress = () => {
  Alert.alert("Alert", "Action triggered");
};

describe("Test Buttons Components - Experimental Enabled", () => {
  it("IconButton Snapshot", () => {
    const { toJSON } = renderWithExperimentalEnabledContextProvider(
      <IconButton
        accessibilityLabel={"accessibilityLabel"}
        icon={"spid"}
        onPress={onButtonPress}
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
