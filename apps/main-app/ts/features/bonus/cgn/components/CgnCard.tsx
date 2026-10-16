import {
  BodySmall,
  H6,
  IOColors,
  Tag,
  useIOThemeContext
} from "@io-app/design-system";
import I18n from "i18next";
import { Image, StyleSheet, View } from "react-native";

import cgnLogo from "../../../../../img/bonus/cgn/cgn_logo.png";
import eycaLogo from "../../../../../img/bonus/cgn/eyca_logo.png";
import CgnCardShapeDarkMode from "../../../../../img/features/cgn/cgn-card-dark.svg";
import CgnCardShapeLightMode from "../../../../../img/features/cgn/cgn-card.svg";
import { format } from "../../../../utils/dates";

export type CgnCardProps = {
  expireDate?: Date;
  withEycaLogo?: boolean;
};

export const CgnCard = ({ expireDate, withEycaLogo }: CgnCardProps) => {
  const { themeType } = useIOThemeContext();
  const isDark = themeType === "dark";

  const textColor: IOColors = isDark ? "grey-50" : "blueItalia-850";

  const isExpired = expireDate === undefined;

  const eycaLogoComponent = (
    <View
      style={[styles.logoContainer, { bottom: 12, right: 12 }]}
      testID="cgnEycaLogoTestID"
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
      style={[styles.logoContainer, { top: 12, right: 12 }]}
      testID="cgnLogoTestID"
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
        text={I18n.t("bonus.cgn.detail.status.badge.expired")}
        variant="error"
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
        {isDark ? <CgnCardShapeDarkMode /> : <CgnCardShapeLightMode />}
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <H6 color={textColor} numberOfLines={1} style={{ flexShrink: 1 }}>
            {I18n.t("bonus.cgn.name")}
          </H6>
          {isExpired && expiredTag}
        </View>
        <BodySmall color={textColor} style={{ width: "70%" }}>
          {I18n.t("bonus.cgn.departmentName")}
        </BodySmall>
        <BodySmall accessibilityLabel={accessibleExpireDate} color={textColor}>
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
