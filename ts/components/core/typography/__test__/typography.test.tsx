import React from "react";
import TestRenderer from "react-test-renderer";
import configureMockStore from "redux-mock-store";
import { Provider } from "react-redux";
import { appReducer } from "../../../../store/reducers";
import { GlobalState } from "../../../../store/reducers/types";
import { IOFontWeight } from "../../fonts";
import type { IOColors } from "../../variables/IOColors";
import { Body } from "../Body";
import { calculateWeightColor } from "../common";
import { H1 } from "../H1";
import { H2 } from "../H2";
import { H3 } from "../H3";
import { H4 } from "../H4";
import { H5 } from "../H5";
import { Label } from "../Label";
import { LabelSmall } from "../LabelSmall";
import { Link } from "../Link";
import { Monospace } from "../Monospace";
import { preferencesDesignSystemSetEnabled } from "../../../../store/actions/persistedPreferences";

const wrapTypographyComponent = (children: React.ReactNode) => {
  const globalState = appReducer(
    undefined,
    preferencesDesignSystemSetEnabled({ isDesignSystemEnabled: false })
  );
  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore({
    ...globalState
  } as GlobalState);

  return <Provider store={store}>{children}</Provider>;
};

describe("Test Typography Components", () => {
  it("H1 Snapshot", () => {
    const h1Default = TestRenderer.create(
      wrapTypographyComponent(<H1>Text</H1>)
    ).toJSON();
    expect(h1Default).toMatchSnapshot();
    const h1White = TestRenderer.create(
      wrapTypographyComponent(<H1 color={"white"}>Text</H1>)
    ).toJSON();
    expect(h1White).toMatchSnapshot();
  });
  it("H2 Snapshot", () => {
    const h2Default = TestRenderer.create(
      wrapTypographyComponent(<H2>Text</H2>)
    ).toJSON();
    expect(h2Default).toMatchSnapshot();
  });
  it("H3 Snapshot", () => {
    // SemiBold weight, default weight
    const h3Default = TestRenderer.create(
      wrapTypographyComponent(<H3>Text</H3>)
    ).toJSON();
    expect(h3Default).toMatchSnapshot();
    const h3bluegreyLight = TestRenderer.create(
      wrapTypographyComponent(<H3 color={"bluegreyLight"}>Text</H3>)
    ).toJSON();
    expect(h3bluegreyLight).toMatchSnapshot();
    const h3white = TestRenderer.create(
      wrapTypographyComponent(<H3 color={"white"}>Text</H3>)
    ).toJSON();
    expect(h3white).toMatchSnapshot();
    const h3whiteBold = TestRenderer.create(
      wrapTypographyComponent(
        <H3 color={"white"} weight={"Bold"}>
          Text
        </H3>
      )
    ).toJSON();
    expect(h3whiteBold).toMatchSnapshot();

    // default color when choose only bold
    const h3defaultBold = TestRenderer.create(
      wrapTypographyComponent(<H3 weight={"Bold"}>Text</H3>)
    ).toJSON();
    expect(h3defaultBold).toMatchSnapshot();
  });
  it("H4 Snapshot", () => {
    // Bold weight, default weight
    const h4Default = TestRenderer.create(
      wrapTypographyComponent(<H4>Text</H4>)
    ).toJSON();
    expect(h4Default).toMatchSnapshot();
    const h4Dblue = TestRenderer.create(
      wrapTypographyComponent(<H4 color={"blue"}>Text</H4>)
    ).toJSON();
    expect(h4Dblue).toMatchSnapshot();
    const h4white = TestRenderer.create(
      wrapTypographyComponent(<H4 color={"white"}>Text</H4>)
    ).toJSON();
    expect(h4white).toMatchSnapshot();
    // SemiBold weight
    const h4SemiBoldwhite = TestRenderer.create(
      wrapTypographyComponent(
        <H4 weight={"SemiBold"} color={"white"}>
          Text
        </H4>
      )
    ).toJSON();
    expect(h4SemiBoldwhite).toMatchSnapshot();

    // Semibold default color
    const h4SemiBoldDefault = TestRenderer.create(
      wrapTypographyComponent(<H4 weight={"SemiBold"}>Text</H4>)
    ).toJSON();
    expect(h4SemiBoldDefault).toMatchSnapshot();

    // Regular weight
    // with regular weight, default color is bluegreydark
    const h4Regular = TestRenderer.create(
      wrapTypographyComponent(<H4 weight={"Regular"}>Text</H4>)
    ).toJSON();
    expect(h4Regular).toMatchSnapshot();

    const h4Regularbluegrey = TestRenderer.create(
      wrapTypographyComponent(
        <H4 weight={"Regular"} color={"bluegrey"}>
          Text
        </H4>
      )
    ).toJSON();
    expect(h4Regularbluegrey).toMatchSnapshot();

    const h4RegularbluegreyLight = TestRenderer.create(
      wrapTypographyComponent(
        <H4 weight={"Regular"} color={"bluegreyLight"}>
          Text
        </H4>
      )
    ).toJSON();
    expect(h4RegularbluegreyLight).toMatchSnapshot();

    const h4Regularwhite = TestRenderer.create(
      wrapTypographyComponent(
        <H4 weight={"Regular"} color={"white"}>
          Text
        </H4>
      )
    ).toJSON();
    expect(h4Regularwhite).toMatchSnapshot();
  });
  it("H5 Snapshot", () => {
    // SemiBold weight, default
    const h5Default = TestRenderer.create(
      wrapTypographyComponent(<H5>Text</H5>)
    ).toJSON();
    expect(h5Default).toMatchSnapshot();
    const h5Defaultbluegrey = TestRenderer.create(
      wrapTypographyComponent(<H5 color={"bluegrey"}>Text</H5>)
    ).toJSON();
    expect(h5Defaultbluegrey).toMatchSnapshot();
    const h5Defaultblue = TestRenderer.create(
      wrapTypographyComponent(<H5 color={"blue"}>Text</H5>)
    ).toJSON();
    expect(h5Defaultblue).toMatchSnapshot();
    const h5Defaultwhite = TestRenderer.create(
      wrapTypographyComponent(<H5 color={"white"}>Text</H5>)
    ).toJSON();
    expect(h5Defaultwhite).toMatchSnapshot();

    // Regular weight
    // with regular weight, default color is bluegreydark
    const h5Regular = TestRenderer.create(
      wrapTypographyComponent(<H5 weight={"Regular"}>Text</H5>)
    ).toJSON();
    expect(h5Regular).toMatchSnapshot();
    const h5Regularbluegrey = TestRenderer.create(
      wrapTypographyComponent(
        <H5 weight={"Regular"} color={"bluegrey"}>
          Text
        </H5>
      )
    ).toJSON();
    expect(h5Regularbluegrey).toMatchSnapshot();
    const h5Regularblue = TestRenderer.create(
      wrapTypographyComponent(
        <H5 weight={"Regular"} color={"blue"}>
          Text
        </H5>
      )
    ).toJSON();
    expect(h5Regularblue).toMatchSnapshot();
  });
  it("Body Snapshot", () => {
    const bodyDefault = TestRenderer.create(
      wrapTypographyComponent(<Body>Text</Body>)
    ).toJSON();
    expect(bodyDefault).toMatchSnapshot();
  });
  it("LabelSmall Snapshot", () => {
    const labelSmallDefault = TestRenderer.create(
      wrapTypographyComponent(<LabelSmall>Text</LabelSmall>)
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
        wrapTypographyComponent(<LabelSmall color={color}>Text</LabelSmall>)
      ).toJSON();
      expect(labelSmall).toMatchSnapshot();
    });
  });
  it("Label Snapshot", () => {
    const labelDefault = TestRenderer.create(
      wrapTypographyComponent(<Label>Text</Label>)
    ).toJSON();
    expect(labelDefault).toMatchSnapshot();

    type BodyColors = React.ComponentProps<typeof Label>["color"];

    const allowedColors: ReadonlyArray<BodyColors> = [
      "blue",
      "bluegrey",
      "white"
    ];

    allowedColors.map(color => {
      const label = TestRenderer.create(
        wrapTypographyComponent(<Label color={color}>Text</Label>)
      ).toJSON();
      expect(label).toMatchSnapshot();
    });
  });
  it("Link Snapshot", () => {
    const link = TestRenderer.create(
      wrapTypographyComponent(<Link>Text</Link>)
    ).toJSON();
    expect(link).toMatchSnapshot();
  });
  it("Monospace Snapshot", () => {
    const monospace = TestRenderer.create(
      wrapTypographyComponent(<Monospace>Text</Monospace>)
    ).toJSON();
    expect(monospace).toMatchSnapshot();
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
