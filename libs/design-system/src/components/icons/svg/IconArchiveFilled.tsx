import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../types";

const IconArchiveFilled = ({ size, style, ...props }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} {...props}>
    <Path
      fill="currentColor"
      fillRule="evenodd"
      d="M2 2C0.895431 2 0 2.89543 0 4V6C0 7.10457 0.89543 8 2 8H22C23.1046 8 24 7.10457 24 6V4C24 2.89543 23.1046 2 22 2H2ZM2 8H22V20C22 22.2091 20.2091 24 18 24H6C3.79086 24 2 22.2091 2 20L2 8ZM8 13C8 12.4477 8.44772 12 9 12H15C15.5523 12 16 12.4477 16 13C16 13.5523 15.5523 14 15 14H9C8.44772 14 8 13.5523 8 13Z"
      clipRule="evenodd"
    />
  </Svg>
);

export default IconArchiveFilled;
