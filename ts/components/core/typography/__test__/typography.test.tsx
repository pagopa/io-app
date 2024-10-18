import React from "react";
import TestRenderer from "react-test-renderer";
import type { IOColors } from "@pagopa/io-app-design-system";
import { IOFontWeight } from "../../fonts";
import { calculateWeightColor } from "../common";
import { LabelSmall } from "../LabelSmall";

describe("Test Typography Components", () => {
  it("LabelSmall Snapshot", () => {
    const labelSmallDefault = TestRenderer.create(
      <LabelSmall>Text</LabelSmall>
    ).toJSON();
    expect(labelSmallDefault).toMatchSnapshot();

    type BodyColors = React.ComponentProps<typeof LabelSmall>["color"];

    const allowedColors: ReadonlyArray<BodyColors> = [
      "blue",
      "bluegrey",
      "red",
      "white"
    ];

    allowedColors.map(color => {
      const labelSmall = TestRenderer.create(
        <LabelSmall color={color}>Text</LabelSmall>
      ).toJSON();
      expect(labelSmall).toMatchSnapshot();
    });
  });
});

describe("Test Typography common", () => {
  it("Test calculateWeightColor behaviour", () => {
    const noValues = calculateWeightColor<IOFontWeight, IOColors>(
      "Bold",
      "red"
    );
    expect(noValues.color).toBe("red");
    expect(noValues.weight).toBe("Bold");

    const weightProvided = calculateWeightColor<IOFontWeight, IOColors>(
      "Bold",
      "red",
      "Regular"
    );
    expect(weightProvided.color).toBe("red");
    expect(weightProvided.weight).toBe("Regular");

    const allValuesProvided = calculateWeightColor<IOFontWeight, IOColors>(
      "Bold",
      "red",
      "Regular",
      "bluegrey"
    );
    expect(allValuesProvided.color).toBe("bluegrey");
    expect(allValuesProvided.weight).toBe("Regular");
  });
});
