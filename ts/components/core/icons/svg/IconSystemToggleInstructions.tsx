import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconSystemToggleInstructions = ({
  size,
  style,
  ...props
}: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} {...props}>
    <Path
      fill="#7FCD7D"
      d="M18 6.545H6c-3.312 0-6 2.81-6 6.273 0 3.463 2.688 6.273 6 6.273h12c3.312 0 6-2.81 6-6.273 0-3.462-2.688-6.273-6-6.273Zm0 10.037c-1.992 0-3.6-1.681-3.6-3.764 0-2.082 1.608-3.763 3.6-3.763s3.6 1.68 3.6 3.763-1.608 3.764-3.6 3.764Z"
    />
  </Svg>
);

export default IconSystemToggleInstructions;
