// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore (ignore Path unused component)
import { Svg } from "react-native-svg";
import { SVGIconProps } from "../types";

// The `generateNewIcons.js`s script uses this template to generate
// the new `Icon…` component. Don't edit this file to avoid
// adding breaking changes to the process.

const IconTemplate = ({ size, style, ...props }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} {...props}>
    {/* SVGContent */}
  </Svg>
);

export default IconTemplate;
