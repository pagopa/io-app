import { fireEvent, render } from "@testing-library/react-native";
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

describe("Banner accessibility", () => {
  test.each([
    { name: "title only", title: "Banner title", content: undefined },
    { name: "content only", title: undefined, content: "Banner content" },
    {
      name: "title and content",
      title: "Banner title",
      content: "Banner content"
    }
  ])("separates text from the CTA with $name", ({ title, content }) => {
    const { getByRole, getAllByRole } = render(
      <Banner
        action="Action text"
        color="neutral"
        content={content}
        onPress={jest.fn()}
        pictogramName="charity"
        title={title}
      />
    );

    expect(
      getByRole("text", {
        name: [title, content].filter(Boolean).join(" ")
      })
    ).toBeOnTheScreen();
    expect(getAllByRole("text")).toHaveLength(1);
    expect(getAllByRole("button")).toHaveLength(1);
    expect(getByRole("button", { name: "Action text" })).toBeOnTheScreen();
  });

  it("keeps the custom text label separate from the action hint and role", () => {
    const { getByRole } = render(
      <Banner
        accessibilityHint="Opens a web page"
        accessibilityLabel="Custom banner description"
        accessibilityRole="link"
        action="Action text"
        color="neutral"
        onPress={jest.fn()}
        pictogramName="charity"
        title="Banner title"
      />
    );

    expect(
      getByRole("text", { name: "Custom banner description" })
    ).not.toHaveProp("accessibilityHint");
    expect(getByRole("link", { name: "Action text" })).toHaveProp(
      "accessibilityHint",
      "Opens a web page"
    );
  });

  it("exposes static content as text without an action", () => {
    const { getByRole, queryByRole } = render(
      <Banner
        accessibilityHint="Banner hint"
        color="neutral"
        content="Banner content"
        pictogramName="charity"
        title="Banner title"
      />
    );

    expect(
      getByRole("text", { name: "Banner title Banner content" })
    ).toHaveProp("accessibilityHint", "Banner hint");
    expect(queryByRole("button")).toBeNull();
  });

  it("activates the CTA and close button independently and preserves full-banner taps", () => {
    const onPress = jest.fn();
    const onClose = jest.fn();
    const { getByRole, getByTestId } = render(
      <Banner
        action="Action text"
        color="neutral"
        labelClose="Close banner"
        onClose={onClose}
        onPress={onPress}
        pictogramName="charity"
        testID="banner"
        title="Banner title"
      />
    );

    const container = getByTestId("banner");
    expect(container).toHaveProp("accessible", false);
    expect(container).toHaveProp("focusable", false);
    expect(container).toHaveProp("importantForAccessibility", "no");

    fireEvent.press(getByRole("button", { name: "Action text" }));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.press(getByRole("button", { name: "Close banner" }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onPress).toHaveBeenCalledTimes(1);

    fireEvent.press(container);
    expect(onPress).toHaveBeenCalledTimes(2);
  });
});
