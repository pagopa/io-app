import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../types";

const IconCheckTick = ({ size, style, ...props }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} {...props}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M17.7071 9.29289C18.0976 9.68342 18.0976 10.3166 17.7071 10.7071L11.4142 17C10.6332 17.781 9.36684 17.7811 8.58579 17L5.29289 13.7071C4.90237 13.3166 4.90237 12.6834 5.29289 12.2929C5.68342 11.9024 6.31658 11.9024 6.70711 12.2929L10 15.5858L16.2929 9.29289C16.6834 8.90237 17.3166 8.90237 17.7071 9.29289Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconCheckTick;
