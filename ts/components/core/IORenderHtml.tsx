import { MixedStyleRecord } from "@native-html/transient-render-engine";
import * as React from "react";
import { useWindowDimensions } from "react-native";
import RenderHtml from "react-native-render-html";
import { allUsedFonts, makeFontStyleObject } from "./fonts";
import {
  bodyDefaultColor,
  bodyDefaultWeight,
  bodyFontSize
} from "./typography/Body";
import {
  h1DefaultColor,
  h1DefaultWeight,
  h1FontSize,
  h1LineHeight
} from "./typography/H1";
import { h2DefaultColor, h2DefaultWeight, h2FontSize } from "./typography/H2";
import { calculateH3WeightColor, h3FontSize } from "./typography/H3";
import { calculateH4WeightColor, h4FontSize } from "./typography/H4";
import { h5DefaultColor, h5DefaultWeight, h5FontSize } from "./typography/H5";
import { linkDefaultColor, linkDefaultWeight } from "./typography/Link";
import { IOColors } from "./variables/IOColors";

type Props = React.ComponentProps<typeof RenderHtml>;

const h3WeightColor = calculateH3WeightColor();
const h4WeightColor = calculateH4WeightColor();

const tagsStyles: MixedStyleRecord = {
  body: {
    whiteSpace: "normal",
    color: IOColors[bodyDefaultColor],
    fontSize: bodyFontSize,
    ...makeFontStyleObject(bodyDefaultWeight)
  },
  a: {
    color: IOColors[linkDefaultColor],
    ...makeFontStyleObject(linkDefaultWeight)
  },
  h1: {
    fontSize: h1FontSize,
    lineHeight: h1LineHeight,
    color: IOColors[h1DefaultColor],
    ...makeFontStyleObject(h1DefaultWeight)
  },
  h2: {
    fontSize: h2FontSize,
    color: IOColors[h2DefaultColor],
    ...makeFontStyleObject(h2DefaultWeight)
  },
  h3: {
    fontSize: h3FontSize,
    color: IOColors[h3WeightColor.color],
    ...makeFontStyleObject(h3WeightColor.weight)
  },
  h4: {
    fontSize: h4FontSize,
    color: IOColors[h4WeightColor.color],
    ...makeFontStyleObject(h4WeightColor.weight)
  },
  h5: {
    fontSize: h5FontSize,
    color: IOColors[h5DefaultColor],
    ...makeFontStyleObject(h5DefaultWeight)
  }
};

const renderersProps = {
  img: {
    enableExperimentalPercentWidth: true
  }
};

/**
 * Wraps the {@link RenderHtml} component with the custom IO Styles & logic
 * This is an experimental component
 * @param props
 * @constructor
 * @experimental
 */
export const IORenderHtml = (props: Props): React.ReactElement => {
  const { width } = useWindowDimensions();

  return (
    <RenderHtml
      {...props}
      systemFonts={allUsedFonts}
      contentWidth={width}
      tagsStyles={{ ...tagsStyles, ...props.tagsStyles }}
      renderersProps={{ ...renderersProps, ...props.renderersProps }}
    />
  );
};
