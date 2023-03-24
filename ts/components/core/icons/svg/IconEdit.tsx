import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconEdit = ({ size, style }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M18.2985 0c-1.0965 0-2.1482.4356-2.9235 1.21095L13.5859 3l7.4143 7.4142 1.789-1.78904a4.1343 4.1343 0 0 0 1.211-2.92349C24.0002 2.55272 21.4474 0 18.2985 0Zm2.7017 10.4142L13.5859 3 .87868 15.7073A2.99985 2.99985 0 0 0 0 17.8286v4.1716c0 1.1045.89543 2 2 2h4.17157a3.00004 3.00004 0 0 0 2.12132-.8787L21.0002 10.4142ZM2.29289 17.1215 15 4.41436l4.5858 4.58579L6.87868 21.7073a1.00017 1.00017 0 0 1-.70711.2929H2v-4.1716c0-.2652.10536-.5196.29289-.7071Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconEdit;
