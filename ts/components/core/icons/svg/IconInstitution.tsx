import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconInstitution = ({ size, style }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M10.39 3.21a3 3 0 0 1 3.22 0l7.927 5.044a1 1 0 0 1 .463.844V10H2v-.902a1 1 0 0 1 .463-.844L10.39 3.21Zm4.294-1.687a5 5 0 0 0-5.368 0L1.389 6.567A3 3 0 0 0 0 9.097V11a1 1 0 0 0 1 1h1v10H1a1 1 0 1 0 0 2h22a1 1 0 1 0 0-2h-1V12h1a1 1 0 0 0 1-1V9.098a3 3 0 0 0-1.39-2.531l-7.926-5.044ZM6 22H4V12h2v10Zm10-10v10H8V12h8Zm4 10h-2V12h2v10ZM13.5 6.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconInstitution;
