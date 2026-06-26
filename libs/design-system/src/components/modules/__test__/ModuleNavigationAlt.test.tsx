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
      <ModuleNavigationAlt title="My Title" onPress={onPress} icon="spid" />
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it("Title + Subtitle", () => {
    const { toJSON } = render(
      <ModuleNavigationAlt
        title="My Title"
        subtitle="A nice subtitle"
        icon="spid"
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it("With Badge (badge + chevron)", () => {
    const { toJSON } = render(
      <ModuleNavigationAlt
        title="With Badge"
        onPress={onPress}
        badge={{ text: "TEST", variant: "highlight" }}
        icon="spid"
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it("With Image (no icon) + chevron (onPress)", () => {
    const { toJSON } = render(
      <ModuleNavigationAlt
        title="With Image"
        image={{ uri: "https://example.com/icon.png" }}
        onPress={onPress}
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
      <ModuleNavigationAlt title="My Title" onPress={onPress} icon="spid" />
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it("Title + Subtitle", () => {
    const { toJSON } = renderWithExperimentalEnabledContextProvider(
      <ModuleNavigationAlt
        title="My Title"
        subtitle="A nice subtitle"
        icon="spid"
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it("With Badge (badge + chevron)", () => {
    const { toJSON } = renderWithExperimentalEnabledContextProvider(
      <ModuleNavigationAlt
        title="With Badge"
        onPress={onPress}
        badge={{ text: "TEST", variant: "highlight" }}
        icon="spid"
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it("With Image (no icon) + chevron (onPress) - Experimental", () => {
    const { toJSON } = renderWithExperimentalEnabledContextProvider(
      <ModuleNavigationAlt
        title="With Image"
        image={{ uri: "https://example.com/icon.png" }}
        onPress={onPress}
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it("should forward testID", () => {
    const { getByTestId } = render(
      <ModuleNavigationAlt
        testID="module-navigation-alt"
        title="With Image"
        image={{ uri: "https://example.com/icon.png" }}
        onPress={jest.fn()}
      />
    );

    expect(getByTestId("module-navigation-alt")).toBeTruthy();
  });
});
