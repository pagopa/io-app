import * as React from "react";
import { View, StyleSheet } from "react-native";
import {
  LogoPaymentViewerBox,
  logoItemGutter
} from "../components/LogoPaymentViewerBox";
import {
  LogoPayment,
  IOLogoPaymentType,
  IOPaymentLogos,
  LogoPaymentExt,
  IOLogoPaymentExtType,
  IOPaymentExtLogos
} from "../../../components/core/logos";
import { H2 } from "../../../components/core/typography/H2";
import { DesignSystemScreen } from "../components/DesignSystemScreen";

const styles = StyleSheet.create({
  itemsWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    marginBottom: 16,
    marginLeft: (logoItemGutter / 2) * -1,
    marginRight: (logoItemGutter / 2) * -1
  }
});

export const LogosShowroom = () => (
  <DesignSystemScreen title={"Logos"}>
    <H2 color={"bluegrey"} weight={"SemiBold"} style={{ marginBottom: 12 }}>
      Payment Networks (Small)
    </H2>
    <View style={styles.itemsWrapper}>
      {Object.entries(IOPaymentLogos).map(([logoItemName]) => (
        <LogoPaymentViewerBox
          key={logoItemName}
          name={logoItemName}
          size="medium"
          image={
            <LogoPayment
              name={logoItemName as IOLogoPaymentType}
              size={"100%"}
            />
          }
        />
      ))}
    </View>
    <H2 color={"bluegrey"} weight={"SemiBold"} style={{ marginBottom: 12 }}>
      Payment Networks (Big)
    </H2>
    <View style={styles.itemsWrapper}>
      {Object.entries(IOPaymentExtLogos).map(([logoItemName]) => (
        <LogoPaymentViewerBox
          key={logoItemName}
          name={logoItemName}
          size="large"
          image={
            <LogoPaymentExt
              name={logoItemName as IOLogoPaymentExtType}
              size={"100%"}
            />
          }
        />
      ))}
    </View>
  </DesignSystemScreen>
);
