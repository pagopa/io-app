import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const LegIconTrashcan = ({ size, style }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <Path
      d="M10 11H9v7h1v-7ZM12 11h1v7h-1v-7ZM16 11h-1v7h1v-7Z"
      fill="currentColor"
    />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M9 5.25V7H5a1 1 0 0 0 0 2h1v10a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V9h1a1 1 0 1 0 0-2h-4V5.25C16 4.56 15.44 4 14.75 4h-4.5C9.56 4 9 4.56 9 5.25ZM15 7h-5V5.538c0-.297.241-.538.539-.538h3.922c.298 0 .539.241.539.538V7Zm3 2H7v10a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V9Z"
      fill="currentColor"
    />
    <Path
      d="M10 11H9v7h1v-7ZM12 11h1v7h-1v-7ZM16 11h-1v7h1v-7Z"
      fill="currentColor"
    />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M9 5.25V7H5a1 1 0 0 0 0 2h1v10a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V9h1a1 1 0 1 0 0-2h-4V5.25C16 4.56 15.44 4 14.75 4h-4.5C9.56 4 9 4.56 9 5.25ZM15 7h-5V5.538c0-.297.241-.538.539-.538h3.922c.298 0 .539.241.539.538V7Zm3 2H7v10a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V9Z"
      fill="currentColor"
    />
  </Svg>
);

export default LegIconTrashcan;
