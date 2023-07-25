import TestRenderer from "react-test-renderer";
import React from "react";
import { TabItem } from "../TabItem";

describe("TabItem", () => {
  it("should match the snapshot with default props", () => {
    expect(
      TestRenderer.create(
        <TabItem
          label="Label tab"
          accessibilityLabel="Label tab"
          accessibilityHint="Label tab"
          onPress={() => undefined}
        />
      )
    ).toMatchSnapshot();
  });

  it("should match the snapshot with icons", () => {
    expect(
      TestRenderer.create(
        <TabItem
          label="Label tab"
          accessibilityLabel="Label tab"
          accessibilityHint="Label tab"
          onPress={() => undefined}
          icon="starEmpty"
          iconSelected="starFilled"
        />
      )
    ).toMatchSnapshot();
  });

  it("should match the snapshot with dark color", () => {
    expect(
      TestRenderer.create(
        <TabItem
          label="Label tab"
          accessibilityLabel="Label tab"
          accessibilityHint="Label tab"
          onPress={() => undefined}
          icon="starEmpty"
          iconSelected="starFilled"
          color="dark"
        />
      )
    ).toMatchSnapshot();
  });

  it("should match the snapshot with dark color and selected state", () => {
    expect(
      TestRenderer.create(
        <TabItem
          label="Label tab"
          accessibilityLabel="Label tab"
          accessibilityHint="Label tab"
          onPress={() => undefined}
          icon="starEmpty"
          iconSelected="starFilled"
          color="dark"
          selected={true}
        />
      )
    ).toMatchSnapshot();
  });

  it("should match the snapshot with full width", () => {
    expect(
      TestRenderer.create(
        <TabItem
          label="Label tab"
          accessibilityLabel="Label tab"
          accessibilityHint="Label tab"
          onPress={() => undefined}
          icon="starEmpty"
          iconSelected="starFilled"
          color="dark"
          selected={true}
          fullWidth={true}
        />
      )
    ).toMatchSnapshot();
  });
});
