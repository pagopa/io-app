import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../types";

const IconPlay = ({ size, style, ...props }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} {...props}>
    <Path
      d="M0 19.277V4.72342C0 0.957176 4.85482 -1.28924 8.47926 0.799896L21.5713 8.3462C24.8754 10.2507 24.7931 14.472 21.4167 16.2792L8.32466 23.2864C4.69129 25.2311 0 22.9717 0 19.277Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconPlay;
