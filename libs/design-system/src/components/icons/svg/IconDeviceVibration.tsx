import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../types";

const IconDeviceVibration = ({ size, style, ...props }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} {...props}>
    <Path
      fill="currentColor"
      fillRule="evenodd"
      d="M9 0C6.23858 0 4 2.23858 4 5V19C4 21.7614 6.23858 24 9 24H15C17.7614 24 20 21.7614 20 19V5C20 2.23858 17.7614 0 15 0H9ZM6 5C6 3.34315 7.34315 2 9 2H15C16.6569 2 18 3.34315 18 5V19C18 20.6569 16.6569 22 15 22H9C7.34315 22 6 20.6569 6 19V5ZM12 20C12.5523 20 13 19.5523 13 19C13 18.4477 12.5523 18 12 18C11.4477 18 11 18.4477 11 19C11 19.5523 11.4477 20 12 20ZM0 8C0 7.44772 0.447715 7 1 7C1.55228 7 2 7.44772 2 8V16C2 16.5523 1.55228 17 1 17C0.447715 17 0 16.5523 0 16V8ZM23 7C22.4477 7 22 7.44772 22 8V16C22 16.5523 22.4477 17 23 17C23.5523 17 24 16.5523 24 16V8C24 7.44772 23.5523 7 23 7Z"
      clipRule="evenodd"
    />
  </Svg>
);

export default IconDeviceVibration;
