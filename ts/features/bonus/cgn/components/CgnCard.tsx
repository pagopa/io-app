import { H6, IOColors, LabelSmallAlt } from "@pagopa/io-app-design-system";
import { format } from "date-fns";
import * as React from "react";
import { Image, StyleSheet, View } from "react-native";
import cgnLogo from "../../../../../img/bonus/cgn/cgn_logo.png";
import eycaLogo from "../../../../../img/bonus/cgn/eyca_logo.png";
import CgnCardShape from "../../../../../img/features/cgn/cgn_card.svg";
import I18n from "../../../../i18n";

export type CgnWalletCardProps = {
  expireDate: Date;
};

export const CgnCard = (props: CgnWalletCardProps) => (
  <View style={styles.container}>
    <View style={styles.card}>
      <CgnCardShape />
    </View>
    <View style={styles.content}>
      <View style={styles.header}>
        <H6>{I18n.t("bonus.cgn.name")}</H6>
        <Image source={cgnLogo} style={styles.logo} />
      </View>
      <LabelSmallAlt style={{ width: "70%" }}>
        {I18n.t("bonus.cgn.departmentName")}
      </LabelSmallAlt>
      <View style={styles.header}>
        <LabelSmallAlt color="blueItalia-850">
          {I18n.t("bonusCard.validUntil", {
            endDate: format(props.expireDate, "MM/YY")
          })}
        </LabelSmallAlt>
        <View style={styles.eycaLogoContainer}>
          <Image source={eycaLogo} style={styles.eycaLogo} />
        </View>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    aspectRatio: 16 / 10
  },
  card: {
    position: "absolute",
    transform: [{ rotateX: "180deg" }],
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  },
  content: {
    flex: 1,
    paddingTop: 12,
    paddingRight: 12,
    paddingBottom: 16,
    paddingLeft: 16,
    justifyContent: "space-between"
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  logo: {
    resizeMode: "contain",
    height: 40,
    width: 40
  },
  eycaLogoContainer: {
    padding: 5,
    backgroundColor: IOColors.white,
    borderRadius: 8
  },
  eycaLogo: { width: 30, height: 30, resizeMode: "contain" }
});
