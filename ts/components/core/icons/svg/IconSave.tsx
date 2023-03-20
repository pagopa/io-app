import React from "react";
import { Svg, Path } from "react-native-svg";
import { SVGIconProps } from "../Icon";

const IconSave = ({ size, style }: SVGIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" style={style}>
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5.23175 13.5107c.35357-.4243.98413-.4816 1.40841-.128L11 17.0158l-.0001-15.86492c0-.55229.4478-1 1-1 .5523 0 1 .44771 1 1L13 17.0159l4.3598-3.6332c.4243-.3536 1.0548-.2963 1.4084.128.3536.4243.2962 1.0549-.128 1.4084l-5.3599 4.4665c-.7416.6181-1.819.6181-2.5607 0l-5.35981-4.4665c-.42428-.3535-.4816-.9841-.12804-1.4084ZM1 17c.55228 0 1 .4477 1 1v1c0 1.6563 1.3442 3 3.00157 3H18.9984C20.6558 22 22 20.6563 22 19v-1c0-.5523.4477-1 1-1s1 .4477 1 1v1c0 2.7619-2.2407 5-5.0016 5H5.00157C2.24066 24 0 21.7619 0 19v-1c0-.5523.44771-1 1-1Z"
      fill="currentColor"
    />
  </Svg>
);

export default IconSave;
