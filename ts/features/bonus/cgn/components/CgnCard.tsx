import { H6, IOColors, BodySmall, Tag } from "@pagopa/io-app-design-system";
import { Image, StyleSheet, View } from "react-native";
import I18n from "i18next";
import cgnLogo from "../../../../../img/bonus/cgn/cgn_logo.png";
import eycaLogo from "../../../../../img/bonus/cgn/eyca_logo.png";
import CgnCardShape from "../../../../../img/features/cgn/cgn-card.svg";
import { format } from "../../../../utils/dates";

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
      <Image
        accessibilityIgnoresInvertColors
        source={eycaLogo}
        style={styles.logo}
      />
    </View>
  );

  const cngLogoComponent = (
    <View
      testID="cgnLogoTestID"
      style={[styles.logoContainer, { top: 12, right: 12 }]}
    >
      <Image
        accessibilityIgnoresInvertColors
        source={cgnLogo}
        style={styles.logo}
      />
    </View>
  );

  const expiredTag = (
    <View style={{ top: 6 }}>
      {/* Offset to avoid overlap with the card cutted area */}
      <Tag
        testID="cgnExpiredTagTestID"
        variant="error"
        text={I18n.t("bonus.cgn.detail.status.badge.expired")}
      />
    </View>
  );

  const accessibleExpireDate = expireDate
    ? I18n.t("bonusCard.validUntil", {
        endDate: format(expireDate, "MMMM, YYYY")
      })
    : "";

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <CgnCardShape />
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <H6
            color="blueItalia-850"
            style={{ flexShrink: 1 }}
            numberOfLines={1}
          >
            {I18n.t("bonus.cgn.name")}
          </H6>
          {isExpired && expiredTag}
        </View>
        <BodySmall color="blueItalia-850" style={{ width: "70%" }}>
          {I18n.t("bonus.cgn.departmentName")}
        </BodySmall>
        <BodySmall
          color="blueItalia-850"
          accessibilityLabel={accessibleExpireDate}
        >
          {expireDate &&
            I18n.t("bonusCard.validUntil", {
              endDate: format(expireDate, "MM/YY")
            })}
        </BodySmall>
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
