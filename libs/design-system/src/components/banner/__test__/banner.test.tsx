import { Alert } from "react-native";
import { render } from "@testing-library/react-native";
import { renderWithExperimentalEnabledContextProvider } from "../../../utils/testing";
import { Banner } from "../Banner";

const onLinkPress = () => {
  Alert.alert("Alert", "Action triggered");
};

describe("Test Banner Components", () => {
  it("Banner Snapshot", () => {
    const { toJSON } = render(
      <Banner
        color="neutral"
        title="Banner title"
        pictogramName="charity"
        action="Action text"
        onPress={onLinkPress}
        accessibilityLabel="Action text"
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });
});

describe("Test Banner Components - Experimental Enabled", () => {
  it("Banner Snapshot", () => {
    const { toJSON } = renderWithExperimentalEnabledContextProvider(
      <Banner
        color="neutral"
        title="Banner title"
        pictogramName="charity"
        action="Action text"
        onPress={onLinkPress}
        accessibilityLabel="Action text"
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
