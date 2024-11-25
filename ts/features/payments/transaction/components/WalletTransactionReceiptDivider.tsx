import { IOColors, useIOTheme } from "@pagopa/io-app-design-system";
import React from "react";
import Svg, { Path } from "react-native-svg";

export const WalletTransactionReceiptDivider = () => {
  const theme = useIOTheme();

  return (
    <Svg
      width="100%"
      height="24"
      viewBox="0 0 360 24"
      preserveAspectRatio="xMin slice"
      fill="none"
    >
      <Path
        d="M0 0H360V20.5645L348.75 24L337.5 20.5645L326.25 24L315 20.5645L303.75 24L292.5 20.5645L281.25 24L270 20.5645L258.75 24L247.5 20.5645L236.25 24L225 20.5645L213.75 24L202.5 20.5645L191.25 24L180 20.5645L168.75 24L157.5 20.5645L146.25 24L135 20.5645L123.75 24L112.5 20.5645L101.25 24L90 20.5645L78.75 24L67.5 20.5645L56.25 24L45 20.5645L33.75 24L22.5 20.5645L11.25 24L0 20.5645L0 0Z"
        fill={IOColors[theme["appBackground-primary"]]}
      />
    </Svg>
  );
};
