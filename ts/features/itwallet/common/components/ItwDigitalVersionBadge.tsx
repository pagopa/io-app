import {
  IOBadgeHSpacing,
  IOBadgeRadius,
  IOBadgeVSpacing,
  IOColors,
  IOVisualCostants,
  makeFontStyleObject
} from "@pagopa/io-app-design-system";
import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import I18n from "../../../../i18n";

type DigitalVersionBadgeProps = {
  credentialType: string;
};

type CredentialTypesProps = {
  background: string;
  foreground: string;
};

const ItwDigitalVersionBadge = ({
  credentialType
}: DigitalVersionBadgeProps) => {
  const mapCredentialTypes: Record<
    NonNullable<string>,
    CredentialTypesProps
  > = {
    MDL: {
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
    }
  };

  const colorProps = mapCredentialTypes[credentialType] || {
    foreground: IOColors["grey-850"],
    background: IOColors["grey-100"]
  };

  const { background, foreground } = colorProps;

  return (
    <View style={styles.wrapper}>
      <View style={[styles.badge, { backgroundColor: background }]}>
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          maxFontSizeMultiplier={IOVisualCostants.maxFontSizeMultiplier}
          style={[
            styles.label,
            styles.labelFont,
            {
              color: foreground
            }
          ]}
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
    right: 0
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      android: {
        textAlignVertical: "center"
      }
    }),
    borderCurve: "continuous",
    borderTopLeftRadius: IOBadgeRadius,
    borderBottomLeftRadius: IOBadgeRadius,
    paddingHorizontal: IOBadgeHSpacing,
    paddingVertical: IOBadgeVSpacing
  },
  label: {
    fontSize: 12,
    lineHeight: 16,
    alignSelf: "center",
    textTransform: "uppercase",
    flexShrink: 1
  },
  labelFont: {
    ...makeFontStyleObject("Regular", false, "ReadexPro")
  }
});

const MemoizedItwDigitalVersionBadge = React.memo(ItwDigitalVersionBadge);

export { MemoizedItwDigitalVersionBadge as ItwDigitalVersionBadge };
