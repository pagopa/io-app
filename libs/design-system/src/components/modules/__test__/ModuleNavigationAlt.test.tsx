// __tests__/ModuleNavigationAlt.test.tsx
import { render } from "@testing-library/react-native";
import { Alert } from "react-native";

import { renderWithExperimentalEnabledContextProvider } from "../../../utils/testing";
import { ModuleNavigationAlt } from "../ModuleNavigationAlt";

const onPress = () => {
  Alert.alert("Alert", "Action triggered");
};

describe("ModuleNavigationAlt - Snapshot", () => {
  it("Loading state", () => {
    const { toJSON } = render(
      <ModuleNavigationAlt
        isLoading
        loadingAccessibilityLabel="loading items"
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it("Title only + chevron (onPress)", () => {
    const { toJSON } = render(
      <ModuleNavigationAlt icon="spid" onPress={onPress} title="My Title" />
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it("Title + Subtitle", () => {
    const { toJSON } = render(
      <ModuleNavigationAlt
        icon="spid"
        subtitle="A nice subtitle"
        title="My Title"
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it("With Badge (badge + chevron)", () => {
    const { toJSON } = render(
      <ModuleNavigationAlt
        badge={{ text: "TEST", variant: "highlight" }}
        icon="spid"
        onPress={onPress}
        title="With Badge"
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it("With Image (no icon) + chevron (onPress)", () => {
    const { toJSON } = render(
      <ModuleNavigationAlt
        image={{ uri: "https://example.com/icon.png" }}
        onPress={onPress}
        title="With Image"
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });
});

describe("ModuleNavigationAlt - Snapshot (Experimental Enabled)", () => {
  it("Loading state", () => {
    const { toJSON } = renderWithExperimentalEnabledContextProvider(
      <ModuleNavigationAlt
        isLoading
        loadingAccessibilityLabel="loading items"
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it("Title only + chevron (onPress)", () => {
    const { toJSON } = renderWithExperimentalEnabledContextProvider(
      <ModuleNavigationAlt icon="spid" onPress={onPress} title="My Title" />
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it("Title + Subtitle", () => {
    const { toJSON } = renderWithExperimentalEnabledContextProvider(
      <ModuleNavigationAlt
        icon="spid"
        subtitle="A nice subtitle"
        title="My Title"
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it("With Badge (badge + chevron)", () => {
    const { toJSON } = renderWithExperimentalEnabledContextProvider(
      <ModuleNavigationAlt
        badge={{ text: "TEST", variant: "highlight" }}
        icon="spid"
        onPress={onPress}
        title="With Badge"
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it("With Image (no icon) + chevron (onPress) - Experimental", () => {
    const { toJSON } = renderWithExperimentalEnabledContextProvider(
      <ModuleNavigationAlt
        image={{ uri: "https://example.com/icon.png" }}
        onPress={onPress}
        title="With Image"
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it("should forward testID", () => {
    const { getByTestId } = render(
      <ModuleNavigationAlt
        image={{ uri: "https://example.com/icon.png" }}
        onPress={jest.fn()}
        testID="module-navigation-alt"
        title="With Image"
      />
    );

    expect(getByTestId("module-navigation-alt")).toBeTruthy();
  });
});
