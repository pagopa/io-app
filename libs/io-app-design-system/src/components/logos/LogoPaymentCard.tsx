import { StyleSheet, View } from "react-native";
import { WithTestID } from "src/utils/types";
import { IOColors, hexToRgba } from "../../core";

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
  name: IOLogoPaymentCardType;
  accessibilityLabel: string;
  align: "start" | "center" | "end";
  width?: "100%" | number;
  height?: number;
  debugMode?: boolean;
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
      accessible={true}
      accessibilityLabel={accessibilityLabel}
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
