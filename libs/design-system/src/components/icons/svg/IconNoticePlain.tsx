import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../types";

const IconNoticePlain = ({ size, style, ...props }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style} {...props}>
    <Path
      fill="currentColor"
      fillRule="evenodd"
      d="M12.0281 22C12.872 22 13.5562 21.3159 13.5562 20.4719C13.5562 19.628 12.872 18.9438 12.0281 18.9438C11.1841 18.9438 10.5 19.628 10.5 20.4719C10.5 21.3159 11.1841 22 12.0281 22ZM12.0281 1.94382C12.5959 1.94382 13.0567 2.40412 13.0567 2.97191L13.0567 15.9765C13.0567 16.5443 12.5964 17.0046 12.0286 17.0046C11.4608 17.0046 11 16.5443 11 15.9765L11 2.97191C11 2.40412 11.4603 1.94382 12.0281 1.94382Z"
      clipRule="evenodd"
    />
  </Svg>
);

export default IconNoticePlain;
