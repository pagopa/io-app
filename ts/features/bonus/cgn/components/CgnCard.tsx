import { H6, IOColors, LabelSmallAlt, Tag } from "@pagopa/io-app-design-system";
import { format } from "date-fns";
import * as React from "react";
import { Image, StyleSheet, View } from "react-native";
import cgnLogo from "../../../../../img/bonus/cgn/cgn_logo.png";
import eycaLogo from "../../../../../img/bonus/cgn/eyca_logo.png";
import CgnCardShape from "../../../../../img/features/cgn/cgn_card.svg";
import I18n from "../../../../i18n";

export type CgnCardProps = {
  expireDate?: Date;
  withEycaLogo?: boolean;
};

export const CgnCard = ({ expireDate, withEycaLogo }: CgnCardProps) => {
  const isExpired = expireDate === undefined;

  const eycaLogoComponent = (
    <View
      testID="cgnEycaLogoTestID"
      style={[styles.logoContainer, { bottom: 12, right: 12 }]}
    >
      <Image source={eycaLogo} style={styles.logo} />
    </View>
  );

  const cngLogoComponent = (
    <View
      testID="cgnLogoTestID"
      style={[styles.logoContainer, { top: 12, right: 12 }]}
    >
      <Image source={cgnLogo} style={styles.logo} />
    </View>
  );

  const expiredTag = (
    <View>
      <Tag
        testID="cgnExpiredTagTestID"
        variant="error"
        text={I18n.t("bonus.cgn.detail.status.badge.expired")}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <CgnCardShape />
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <H6>{I18n.t("bonus.cgn.name")}</H6>
          {isExpired && expiredTag}
        </View>
        <LabelSmallAlt style={{ width: "70%" }}>
          {I18n.t("bonus.cgn.departmentName")}
        </LabelSmallAlt>
        <LabelSmallAlt color="blueItalia-850">
          {expireDate &&
            I18n.t("bonusCard.validUntil", {
              endDate: format(expireDate, "MM/YY")
            })}
        </LabelSmallAlt>
      </View>
      {!isExpired && cngLogoComponent}
      {withEycaLogo && eycaLogoComponent}
    </View>
  );
};

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
    padding: 16,
    paddingTop: 12,
    justifyContent: "space-between"
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 48
  },
  logoContainer: {
    position: "absolute",
    padding: 5,
    backgroundColor: IOColors.white,
    borderRadius: 8
  },
  logo: {
    width: 30,
    height: 30,
    resizeMode: "contain"
  }
});
