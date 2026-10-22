import {
  IOBadgeHSpacing,
  IOBadgeRadius,
  IOBadgeVSpacing,
  IOColors,
  makeFontStyleObject
} from "@io-app/design-system";
import Color from "color";
import I18n from "i18next";
import { memo } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

import { useIOSelector } from "../../../../../store/hooks";
import { fontPreferenceSelector } from "../../../../../store/reducers/persistedPreferences";
import { getCardBackgroundImage } from "./backgroundUtils";
import { CardColorScheme } from "./types";

type CredentialTypesProps = {
  background: Array<string> | string;
  foreground: string;
};

type DigitalVersionBadgeProps = {
  colorScheme: CardColorScheme;
  credentialType: string;
};

/** Gradient badges go from left to right */
const BADGE_GRADIENT_ANGLE = 90;

const colorPropsByCredentialType: Record<string, CredentialTypesProps> = {
  mDL: {
    foreground: "#5E303E",
    background: "#FADCF5"
  },
  EuropeanDisabilityCard: {
    foreground: "#01527F",
    background: "#E8EEF4"
  },
  EuropeanHealthInsuranceCard: {
    foreground: "#032D5C",
    background: "#ABD8F2"
  },
  education_degree: {
    foreground: "#403C36",
    background: ["#ECECEC", "#F2F1CE"]
  },
  education_enrollment: {
    foreground: "#403C36",
    background: ["#ECECEC", "#E0F2CE"]
  },
  residency: {
    foreground: "#403C36",
    background: ["#ECECEC", "#F2E4CE"]
  }
};

const getColorPropsByScheme = (
  credentialType: string,
  colorScheme: CardColorScheme
) => {
  const baseColorProps = colorPropsByCredentialType[credentialType];
  if (!baseColorProps) {
    return;
  }

  if (colorScheme === "greyscale") {
    if (Array.isArray(baseColorProps.background)) {
      return {
        foreground: Color(baseColorProps.foreground).grayscale().hex(),
        background: baseColorProps.background.map(c =>
          Color(c).grayscale().hex()
        )
      };
    }
    return {
      foreground: Color(baseColorProps.foreground).grayscale().hex(),
      background: Color(baseColorProps.background).grayscale().hex()
    };
  }

  return baseColorProps;
};

const DigitalVersionBadge = ({
  credentialType,
  colorScheme = "default"
}: DigitalVersionBadgeProps) => {
  const typefacePreference = useIOSelector(fontPreferenceSelector);

  const colorProps = getColorPropsByScheme(credentialType, colorScheme);

  // If a credential does not have the color configuration means that we should not display the badge
  if (!colorProps) {
    return null;
  }

  const { background, foreground } = colorProps;

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.badge,
          Array.isArray(background)
            ? {
                experimental_backgroundImage: getCardBackgroundImage({
                  type: "linear",
                  angle: BADGE_GRADIENT_ANGLE,
                  colors: background
                })
              }
            : { backgroundColor: background }
        ]}
      >
        {colorScheme !== "default" && <View style={styles.faded} />}
        <Text
          ellipsizeMode="tail"
          maxFontSizeMultiplier={1.25}
          numberOfLines={1}
          style={{
            color: foreground,
            alignSelf: "center",
            textTransform: "uppercase",
            flexShrink: 1,
            zIndex: 20,
            ...makeFontStyleObject(
              12,
              typefacePreference === "comfortable"
                ? "Titillio"
                : "TitilliumSansPro",
              16,
              "Semibold"
            )
          }}
        >
          {`${I18n.t("features.itWallet.card.digital")}`}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 16,
    right: 2
  },
  badge: {
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      android: {
        textAlignVertical: "center"
      }
    }),
    borderCurve: "continuous",
    borderRadius: IOBadgeRadius,
    paddingHorizontal: IOBadgeHSpacing,
    paddingVertical: IOBadgeVSpacing,
    paddingEnd: IOBadgeHSpacing + 8,
    marginEnd: -IOBadgeHSpacing
  },
  faded: {
    ...StyleSheet.absoluteFill,
    backgroundColor: IOColors.white,
    opacity: 0.6,
    zIndex: 10
  }
});

const MemoizedDigitalVersionBadge = memo(DigitalVersionBadge);

export { MemoizedDigitalVersionBadge as DigitalVersionBadge };
