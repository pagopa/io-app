import { StyleSheet, View } from "react-native";

import { hexToRgba, IOColors } from "../../core";
import { WithTestID } from "../../utils/types";
/* Logos */
import LogoPaymentCardBancomatPay from "./svg/LogoPaymentCardBancomatPay";
import LogoPaymentCardPayPal from "./svg/LogoPaymentCardPayPal";
import { SVGCardLogoProps } from "./types";

export const IOPaymentCardLogos = {
  payPal: LogoPaymentCardPayPal,
  bancomatPay: LogoPaymentCardBancomatPay
} as const;

export type IOLogoPaymentCardType = keyof typeof IOPaymentCardLogos;

type IOPaymentLogos = WithTestID<{
  accessibilityLabel: string;
  align: "center" | "end" | "start";
  debugMode?: boolean;
  height?: number;
  name: IOLogoPaymentCardType;
  width?: "100%" | number;
}>;

const preserveAspectRatioValues: Record<
  IOPaymentLogos["align"],
  SVGCardLogoProps["preserveAspectRatio"]
> = {
  start: "xMinYMin meet",
  center: "xMidYMid meet",
  end: "xMaxYMax meet"
};

const styles = StyleSheet.create({
  debugMode: {
    backgroundColor: hexToRgba(IOColors["error-500"], 0.2)
  }
});

const LogoPaymentCard = ({
  name,
  width = "100%",
  height = 32,
  align = "center",
  accessibilityLabel,
  testID,
  debugMode = false,
  ...props
}: IOPaymentLogos) => {
  const LogoElement = IOPaymentCardLogos[name];
  return (
    <View
      accessibilityLabel={accessibilityLabel}
      accessible={true}
      style={[{ width, height }, debugMode && styles.debugMode]}
      testID={testID}
    >
      <LogoElement
        preserveAspectRatio={preserveAspectRatioValues[align]}
        {...props}
      />
    </View>
  );
};

export default LogoPaymentCard;
