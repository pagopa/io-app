import { Alert } from "react-native";

import { renderWithExperimentalEnabledContextProvider } from "../../../../utils/testing";
import { IconButtonSolid } from "../IconButtonSolid";

const onButtonPress = () => {
  Alert.alert("Alert", "Action triggered");
};

describe("Test Buttons Components - Experimental Enabled", () => {
  it("IconButtonSolid Snapshot", () => {
    const { toJSON } = renderWithExperimentalEnabledContextProvider(
      <IconButtonSolid
        accessibilityLabel={"accessibilityLabel"}
        icon={"spid"}
        onPress={onButtonPress}
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
