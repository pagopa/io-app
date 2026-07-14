import { render } from "@testing-library/react-native";
import { Alert } from "react-native";

import { renderWithExperimentalEnabledContextProvider } from "../../../utils/testing";
import { Banner } from "../Banner";

const onLinkPress = () => {
  Alert.alert("Alert", "Action triggered");
};

describe("Test Banner Components", () => {
  it("Banner Snapshot", () => {
    const { toJSON } = render(
      <Banner
        accessibilityLabel="Action text"
        action="Action text"
        color="neutral"
        onPress={onLinkPress}
        pictogramName="charity"
        title="Banner title"
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });
});

describe("Test Banner Components - Experimental Enabled", () => {
  it("Banner Snapshot", () => {
    const { toJSON } = renderWithExperimentalEnabledContextProvider(
      <Banner
        accessibilityLabel="Action text"
        action="Action text"
        color="neutral"
        onPress={onLinkPress}
        pictogramName="charity"
        title="Banner title"
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
