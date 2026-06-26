// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore (ignore Path unused component)
import { Svg, Path } from "react-native-svg";
import { SVGPictogramProps } from "../types";

// The `generateNewPictograms.js`s script uses this template to generate
// the new `Pictogram…` component. Don't edit this file to avoid
// adding breaking changes to the process.

const PictogramTemplate = ({
  size,
  colorValues,
  ...props
}: SVGPictogramProps) => (
  <Svg width={size} height={size} viewBox="0 0 240 240" {...props}>
    {/* SVGContent */}
  </Svg>
);

export default PictogramTemplate;
