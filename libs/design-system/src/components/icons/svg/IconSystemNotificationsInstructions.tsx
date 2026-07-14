import { Circle, Path, Rect, Svg } from "react-native-svg";
import { SVGIconProps } from "../types";

const IconSystemNotificationsInstructions = ({
  size,
  style,
  ...props
}: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} {...props}>
    <Rect width={size} height={size} fill="#EB4E3E" rx="4.364" />
    <Path
      fill="#EB4E3E"
      stroke="#fff"
      stroke-width="1.091"
      d="M4.909 8.727c0-1.044 0-1.772.075-2.321.072-.534.203-.816.404-1.018.201-.2.484-.332 1.018-.404.549-.074 1.277-.075 2.32-.075h6.546c1.044 0 1.772.001 2.322.075.533.072.816.203 1.017.404.202.202.333.484.404 1.018.074.55.076 1.277.076 2.321v6.546c0 1.044-.002 1.772-.076 2.321-.071.534-.202.816-.404 1.018-.201.201-.484.332-1.017.404-.55.074-1.278.075-2.322.075H8.727c-1.044 0-1.772-.001-2.321-.075-.534-.072-.817-.203-1.018-.404-.201-.201-.332-.484-.404-1.018-.074-.55-.075-1.277-.075-2.321V8.727Z"
    />
    <Circle
      cx="17.454"
      cy="7.091"
      r="3.818"
      fill="#fff"
      stroke="#EB4E3E"
      stroke-width="1.091"
    />
  </Svg>
);

export default IconSystemNotificationsInstructions;
