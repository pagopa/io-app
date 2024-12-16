import {
  IOBadgeHSpacing,
  IOBadgeRadius,
  IOBadgeVSpacing,
  IOColors,
  makeFontStyleObject
} from "@pagopa/io-app-design-system";
import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import I18n from "../../../../i18n";

type DigitalVersionBadgeProps = {
  credentialType: string;
  isFaded?: boolean;
};

type CredentialTypesProps = {
  background: string;
  foreground: string;
};

const ItwDigitalVersionBadge = ({
  credentialType,
  isFaded = false
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

  const colorProps = mapCredentialTypes[credentialType];
  if (!colorProps) {
    // If a credential does not have the color configuration means that we should not display the badge
    return null;
  }

  const { background, foreground } = colorProps;

  return (
    <View style={styles.wrapper}>
      <View style={[styles.badge, { backgroundColor: background }]}>
        {isFaded && <View style={styles.faded} />}
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
    ...StyleSheet.absoluteFillObject,
    backgroundColor: IOColors.white,
    opacity: 0.6,
    zIndex: 10
  },
  label: {
    alignSelf: "center",
    textTransform: "uppercase",
    flexShrink: 1,
    ...makeFontStyleObject(12, "Titillio", 16, "Regular")
  }
});

const MemoizedItwDigitalVersionBadge = React.memo(ItwDigitalVersionBadge);

export { MemoizedItwDigitalVersionBadge as ItwDigitalVersionBadge };
