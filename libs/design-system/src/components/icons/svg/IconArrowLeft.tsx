import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../types";

const IconArrowLeft = ({ size, style, ...props }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} {...props}>
    <Path
      fill="currentColor"
      d="M6.768 17.36a1 1 0 0 1-1.536 1.28L.765 13.28a2 2 0 0 1 0-2.56l4.467-5.36a1 1 0 1 1 1.536 1.28L3.135 11H23a1 1 0 1 1 0 2H3.135l3.633 4.36Z"
    />
  </Svg>
);

export default IconArrowLeft;
