import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const LegIconAnalytics = ({ size, style }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M2.07 5.442C1.32 5.442.75 6.1.75 6.861v14.97c0 .76.57 1.419 1.32 1.419h4.098c.748 0 1.318-.658 1.318-1.42V6.86c0-.76-.57-1.418-1.318-1.418H2.069Zm.072 16.332V6.918h3.952v14.856H2.142ZM9.95 10.646c-.746 0-1.316.658-1.316 1.418v9.767c0 .76.57 1.42 1.317 1.42h4.098c.749 0 1.32-.659 1.32-1.42v-9.766c0-.762-.571-1.419-1.32-1.419H9.951Zm.076 11.128v-9.652h3.95v9.652h-3.95ZM17.834.75c-.748 0-1.32.658-1.32 1.419v19.662c0 .761.572 1.419 1.32 1.419h4.098c.748 0 1.318-.658 1.318-1.42V2.17c0-.76-.57-1.419-1.318-1.419h-4.098Zm.073 21.024V2.226h3.95v19.548h-3.95Z"
      fill="currentColor"
    />
  </Svg>
);

export default LegIconAnalytics;
