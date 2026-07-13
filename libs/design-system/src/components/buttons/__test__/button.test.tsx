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
        variant="solid"
        label={"label"}
        accessibilityLabel={"accessibilityLabel"}
        onPress={onButtonPress}
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it("ButtonLink Snapshot", () => {
    const { toJSON } = render(
      <IOButton variant="link" label={"label"} onPress={onButtonPress} />
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it("ButtonOutline Snapshot", () => {
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

describe("Test Buttons Components - Experimental Enabled", () => {
  it("ButtonSolid Snapshot", () => {
    const { toJSON } = renderWithExperimentalEnabledContextProvider(
      <IOButton
        variant="solid"
        label={"label"}
        accessibilityLabel={"accessibilityLabel"}
        onPress={onButtonPress}
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it("ButtonLink Snapshot", () => {
    const { toJSON } = renderWithExperimentalEnabledContextProvider(
      <IOButton variant="link" label={"label"} onPress={onButtonPress} />
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it("ButtonOutline Snapshot", () => {
    const { toJSON } = renderWithExperimentalEnabledContextProvider(
      <IOButton
        variant="outline"
        label={"label"}
        accessibilityLabel={"accessibilityLabel"}
        onPress={onButtonPress}
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it("IconButtonSolid Snapshot", () => {
    const { toJSON } = renderWithExperimentalEnabledContextProvider(
      <IconButtonSolid
        onPress={onButtonPress}
        icon={"spid"}
        accessibilityLabel={"accessibilityLabel"}
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it("IconButton Snapshot", () => {
    const { toJSON } = renderWithExperimentalEnabledContextProvider(
      <IconButton
        onPress={onButtonPress}
        icon={"spid"}
        accessibilityLabel={"accessibilityLabel"}
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it("IconButtonContained Snapshot", () => {
    const { toJSON } = renderWithExperimentalEnabledContextProvider(
      <IconButtonContained
        onPress={onButtonPress}
        icon={"spid"}
        accessibilityLabel={"accessibilityLabel"}
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
