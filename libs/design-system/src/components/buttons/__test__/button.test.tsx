import { render } from "@testing-library/react-native";
import { Alert } from "react-native";

import { renderWithExperimentalEnabledContextProvider } from "../../../utils/testing";
import { IconButton } from "../IconButton";
import { IconButtonContained } from "../IconButtonContained";
import { IconButtonSolid } from "../IconButtonSolid";
import { IOButton } from "../IOButton";

const onButtonPress = () => {
  Alert.alert("Alert", "Action triggered");
};

describe("Test Buttons Components", () => {
  it("ButtonSolid Snapshot", () => {
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

  it("ButtonLink Snapshot", () => {
    const { toJSON } = render(
      <IOButton label={"label"} onPress={onButtonPress} variant="link" />
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it("ButtonOutline Snapshot", () => {
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

describe("Test Buttons Components - Experimental Enabled", () => {
  it("ButtonSolid Snapshot", () => {
    const { toJSON } = renderWithExperimentalEnabledContextProvider(
      <IOButton
        accessibilityLabel={"accessibilityLabel"}
        label={"label"}
        onPress={onButtonPress}
        variant="solid"
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it("ButtonLink Snapshot", () => {
    const { toJSON } = renderWithExperimentalEnabledContextProvider(
      <IOButton label={"label"} onPress={onButtonPress} variant="link" />
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it("ButtonOutline Snapshot", () => {
    const { toJSON } = renderWithExperimentalEnabledContextProvider(
      <IOButton
        accessibilityLabel={"accessibilityLabel"}
        label={"label"}
        onPress={onButtonPress}
        variant="outline"
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });

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

  it("IconButtonContained Snapshot", () => {
    const { toJSON } = renderWithExperimentalEnabledContextProvider(
      <IconButtonContained
        accessibilityLabel={"accessibilityLabel"}
        icon={"spid"}
        onPress={onButtonPress}
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
