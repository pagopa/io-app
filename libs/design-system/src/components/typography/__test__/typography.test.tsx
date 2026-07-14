import { render } from "@testing-library/react-native";
import { ComponentProps } from "react";
import { Alert } from "react-native";
import type { IOColors } from "../../../core/IOColors";
import { IOFontWeight } from "../../../utils/fonts";
import { Body } from "../Body";
import { BodyMonospace } from "../BodyMonospace";
import { BodySmall } from "../BodySmall";
import { ButtonText } from "../ButtonText";
import { calculateWeightColor } from "../common";
import { H1 } from "../H1";
import { H2 } from "../H2";
import { H3 } from "../H3";
import { H4 } from "../H4";
import { H5 } from "../H5";
import { H6 } from "../H6";

describe("Test Typography Components", () => {
  it("H1 Snapshot", () => {
    const { toJSON: H1Default } = render(<H1>Text</H1>);
    expect(H1Default()).toMatchSnapshot();
    const { toJSON: H1White } = render(<H1 color={"white"}>Text</H1>);
    expect(H1White()).toMatchSnapshot();
  });
  it("H2 Snapshot", () => {
    const { toJSON: H2Default } = render(<H2>Text</H2>);
    expect(H2Default()).toMatchSnapshot();
  });
  it("H3 Snapshot", () => {
    // SemiBold weight, default weight
    const { toJSON: H3Default } = render(<H3>Text</H3>);
    expect(H3Default()).toMatchSnapshot();
    const { toJSON: H3Grey } = render(<H3 color={"grey-200"}>Text</H3>);
    expect(H3Grey()).toMatchSnapshot();
    const { toJSON: H3White } = render(<H3 color={"white"}>Text</H3>);
    expect(H3White()).toMatchSnapshot();
  });
  it("H4 Snapshot", () => {
    // Bold weight, default weight
    const { toJSON: H4Default } = render(<H4>Text</H4>);
    expect(H4Default()).toMatchSnapshot();
    const { toJSON: H4Blue } = render(<H4 color={"blueIO-500"}>Text</H4>);
    expect(H4Blue()).toMatchSnapshot();
    const { toJSON: H4White } = render(<H4 color={"white"}>Text</H4>);
    expect(H4White()).toMatchSnapshot();
  });
  it("H5 Snapshot", () => {
    // SemiBold weight, default
    const { toJSON: H5Default } = render(<H5>Text</H5>);
    expect(H5Default()).toMatchSnapshot();
    const { toJSON: H5Grey } = render(<H5 color={"grey-700"}>Text</H5>);
    expect(H5Grey()).toMatchSnapshot();
    const { toJSON: H5Blue } = render(<H5 color={"blueIO-500"}>Text</H5>);
    expect(H5Blue()).toMatchSnapshot();
    const { toJSON: H5White } = render(<H5 color={"white"}>Text</H5>);
    expect(H5White()).toMatchSnapshot();
  });
  it("H6 Snapshot", () => {
    // SemiBold weight, default
    const { toJSON: H6Default } = render(<H6>Text</H6>);
    expect(H6Default()).toMatchSnapshot();
  });
  it("Body Snapshot", () => {
    const { toJSON: BodyDefault } = render(<Body>Text</Body>);
    expect(BodyDefault()).toMatchSnapshot();
  });
  it("ButtonText Snapshot", () => {
    const { toJSON: ButtonTextDefault } = render(<ButtonText>Text</ButtonText>);
    expect(ButtonTextDefault()).toMatchSnapshot();
  });
  it("BodySmall Snapshot", () => {
    const { toJSON: toJSONDefault } = render(<BodySmall>Text</BodySmall>);
    expect(toJSONDefault()).toMatchSnapshot();

    type BodyColors = ComponentProps<typeof BodySmall>["color"];

    const allowedColors: ReadonlyArray<BodyColors> = [
      "blueIO-500",
      "grey-700",
      "error-600",
      "white"
    ];

    allowedColors.map(color => {
      const { toJSON: componentVariant } = render(
        <BodySmall color={color}>Text</BodySmall>
      );
      expect(componentVariant()).toMatchSnapshot();
    });
  });
  it("Body as Link Snapshot", () => {
    const { toJSON: BodyLink } = render(
      <Body asLink onPress={() => Alert.alert("Pressed")}>
        Text
      </Body>
    );
    expect(BodyLink()).toMatchSnapshot();
  });
  it("BodyMonospace Snapshot", () => {
    const { toJSON: BodyMonospaceDefault } = render(
      <BodyMonospace>Text</BodyMonospace>
    );
    expect(BodyMonospaceDefault()).toMatchSnapshot();
  });
});

describe("Test Typography common", () => {
  it("Test calculateWeightColor behaviour", () => {
    const noValues = calculateWeightColor<IOFontWeight, IOColors>(
      "Bold",
      "error-600"
    );
    expect(noValues.color).toBe("error-600");
    expect(noValues.weight).toBe("Bold");

    const weightProvided = calculateWeightColor<IOFontWeight, IOColors>(
      "Bold",
      "error-600",
      "Regular"
    );
    expect(weightProvided.color).toBe("error-600");
    expect(weightProvided.weight).toBe("Regular");

    const allValuesProvided = calculateWeightColor<IOFontWeight, IOColors>(
      "Bold",
      "error-600",
      "Regular",
      "grey-700"
    );
    expect(allValuesProvided.color).toBe("grey-700");
    expect(allValuesProvided.weight).toBe("Regular");
  });
});
