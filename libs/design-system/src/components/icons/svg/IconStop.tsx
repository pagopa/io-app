import { Path, Svg } from "react-native-svg";
import { SVGIconProps } from "../types";

const IconStop = ({ size, style, ...props }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} {...props}>
    <Path
      d="M0 3C0 1.34315 1.34315 0 3 0H21C22.6569 0 24 1.34315 24 3V21C24 22.6569 22.6569 24 21 24H3C1.34314 24 0 22.6569 0 21V3Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconStop;
