import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../types";

const IconArrowRight = ({ size, style, ...props }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} {...props}>
    <Path
      fill="currentColor"
      d="M17.232 17.36a1 1 0 0 0 1.536 1.28l4.467-5.36a2 2 0 0 0 0-2.56l-4.467-5.36a1 1 0 1 0-1.536 1.28L20.865 11H1a1 1 0 1 0 0 2h19.865l-3.633 4.36Z"
    />
  </Svg>
);

export default IconArrowRight;
