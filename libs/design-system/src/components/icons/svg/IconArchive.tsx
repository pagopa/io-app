import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../types";

const IconArchive = ({ size, style, ...props }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} {...props}>
    <Path
      fill="currentColor"
      fillRule="evenodd"
      d="M0 4c0-1.65685 1.34315-3 3-3h18c1.6569 0 3 1.34315 3 3v2c0 1.30622-.8348 2.41746-2 2.82929V18c0 2.7614-2.2386 5-5 5H7c-2.76142 0-5-2.2386-5-5V8.82929C.8348 8.41746 0 7.30622 0 6V4Zm4 5h16v9c0 1.6569-1.3431 3-3 3H7c-1.65685 0-3-1.3431-3-3V9Zm18-3c0 .55228-.4477 1-1 1H3c-.55228 0-1-.44771-1-1V4c0-.55228.44772-1 1-1h18c.5523 0 1 .44771 1 1v2ZM9 11c-.55229 0-1 .4477-1 1s.44771 1 1 1h6c.5523 0 1-.4477 1-1s-.4477-1-1-1H9Z"
      clipRule="evenodd"
    />
  </Svg>
);

export default IconArchive;
