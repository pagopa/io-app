import {
  IOBadgeHSpacing,
  IOBadgeRadius,
  IOBadgeVSpacing,
  makeFontStyleObject
} from "@pagopa/io-app-design-system";
import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import I18n from "../../../../../i18n";

type DigitalVersionBadgeProps = {
  credentialType: string;
};

type CredentialTypesProps = {
  background: string;
  foreground: string;
};

const DigitalVersionBadge = ({ credentialType }: DigitalVersionBadgeProps) => {
  const mapCredentialTypes: Record<
    NonNullable<string>,
    CredentialTypesProps
  > = {
    MDL: {
      foreground: "#5E303E",
      background: "#FADCF5"
    }
  };

  const colorProps = mapCredentialTypes[credentialType];
  if (!colorProps) {
    return null;
  }

  const { background, foreground } = colorProps;

  return (
    <View style={styles.wrapper}>
      <View style={[styles.badge, { backgroundColor: background }]}>
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          allowFontScaling={false}
          style={[
            styles.label,
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
    alignSelf: "center",
    textTransform: "uppercase",
    flexShrink: 1,
    ...makeFontStyleObject(12, "ReadexPro", 16, "Regular")
  }
});

const MemoizedDigitalVersionBadge = React.memo(DigitalVersionBadge);

export { MemoizedDigitalVersionBadge as DigitalVersionBadge };
