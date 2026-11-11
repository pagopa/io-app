import { fireEvent, render } from "@testing-library/react-native";
import { Alert } from "react-native";

import { renderWithExperimentalEnabledContextProvider } from "../../../utils/testing";
import { Banner } from "../Banner";

const onLinkPress = () => {
  Alert.alert("Alert", "Action triggered");
};

describe("Test Banner Components", () => {
  it("exposes a single accessible button that triggers the action", () => {
    const onPress = jest.fn();
    const label = "Banner title Banner content Action text";
    const { getAllByRole } = render(
      <Banner
        action="Action text"
        color="neutral"
        content="Banner content"
        onPress={onPress}
        pictogramName="charity"
        title="Banner title"
      />
    );

    const buttons = getAllByRole("button");
    expect(buttons).toHaveLength(1);
    expect(buttons[0].props.accessible).toBe(true);
    expect(buttons[0].props.accessibilityLabel).toBe(label);

    fireEvent.press(buttons[0]);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

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
