import * as React from "react";
import { View, StyleSheet } from "react-native";
import { IconViewerBox, iconItemGutter } from "../components/IconViewerBox";
import { ShowroomSection } from "../components/ShowroomSection";
import {
  LogoPayment,
  IOLogoPaymentType,
  IOPaymentLogos
} from "../../../components/core/logos";
import { H2 } from "../../../components/core/typography/H2";

const styles = StyleSheet.create({
  itemsWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    marginBottom: 16,
    marginLeft: (iconItemGutter / 2) * -1,
    marginRight: (iconItemGutter / 2) * -1
  }
});

export const LogosShowroom = () => (
  <ShowroomSection title={"Logos"}>
    <H2 color={"bluegrey"} weight={"SemiBold"} style={{ marginBottom: 12 }}>
      Payment Networks (Small)
    </H2>
    <View style={styles.itemsWrapper}>
      {Object.entries(IOPaymentLogos).map(([logoItemName]) => (
        <IconViewerBox
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
  </ShowroomSection>
);
