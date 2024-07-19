import {
  Badge,
  Body,
  HSpacer,
  IOColors,
  Tag
} from "@pagopa/io-app-design-system";
import React from "react";
import { ImageSourcePropType, StyleSheet, View } from "react-native";
import { AnimatedImage } from "../../../../components/AnimatedImage";
import I18n from "../../../../i18n";
import { CredentialType } from "../utils/itwMocksUtils";

export type ItwCredentialStatus = "valid" | "pending" | "expiring" | "expired";

export type ItwCredentialCard = {
  credentialType: CredentialType;
  status?: ItwCredentialStatus;
  isPreview?: boolean;
};

export const ItwCredentialCard = ({
  status = "valid",
  credentialType,
  isPreview = false
}: ItwCredentialCard) => {
  const isValid = status === "valid";
  const labelColor: IOColors = isValid ? "bluegreyDark" : "grey-700";

  const cardBackgroundSource =
    credentialCardBackgrounds[credentialType][isValid ? 0 : 1];
  const statusTagProps = tagPropsByStatus[status];

  return (
    <View style={isPreview && styles.previewContainer}>
      <View style={styles.cardContainer}>
        <View style={styles.card}>
          <AnimatedImage
            source={cardBackgroundSource}
            style={styles.cardBackground}
          />
        </View>
        <View style={styles.infoContainer}>
          <View style={styles.header}>
            <Body
              color={labelColor}
              weight="Semibold"
              numberOfLines={2}
              style={{ flex: 1 }}
            >
              {cardLabelByCredentialType[credentialType].toUpperCase()}
            </Body>
            {statusTagProps && (
              <>
                <HSpacer size={16} />
                <Tag {...statusTagProps} />
              </>
            )}
          </View>
        </View>
        {!isValid && <DigitalVersionBadge />}
        <View
          style={[styles.border, { borderColor: borderColorByStatus[status] }]}
        />
      </View>
    </View>
  );
};

const DigitalVersionBadge = () => (
  <View style={styles.digitalVersionBadge}>
    <Badge
      // The space at the end is an hack to have extra padding inside the badge text
      text={`${I18n.t("features.itWallet.card.digital")}   `}
      variant="default"
    />
  </View>
);

const cardLabelByCredentialType: { [type in CredentialType]: string } = {
  EuropeanDisabilityCard: I18n.t("features.itWallet.card.label.dc"),
  EuropeanHealthInsuranceCard: I18n.t("features.itWallet.card.label.ts"),
  mDL: I18n.t("features.itWallet.card.label.mdl"),
  PersonIdentificationData: I18n.t("features.itWallet.card.label.eid")
};

const credentialCardBackgrounds: {
  [type in CredentialType]: [ImageSourcePropType, ImageSourcePropType];
} = {
  EuropeanDisabilityCard: [
    require("../../../../../img/features/itWallet/cards/dc.png"),
    require("../../../../../img/features/itWallet/cards/dc_off.png")
  ],
  EuropeanHealthInsuranceCard: [
    require("../../../../../img/features/itWallet/cards/ts.png"),
    require("../../../../../img/features/itWallet/cards/ts_off.png")
  ],
  mDL: [
    require("../../../../../img/features/itWallet/cards/mdl.png"),
    require("../../../../../img/features/itWallet/cards/mdl_off.png")
  ],
  PersonIdentificationData: [
    require("../../../../../img/features/itWallet/cards/eid.png"),
    require("../../../../../img/features/itWallet/cards/eid_off.png")
  ]
};

const tagPropsByStatus: { [key in ItwCredentialStatus]?: Tag } = {
  expired: {
    variant: "error",
    text: I18n.t("features.itWallet.card.status.expired")
  },
  expiring: {
    variant: "warning",
    text: I18n.t("features.itWallet.card.status.expiring")
  },
  pending: {
    variant: "customIcon",
    text: I18n.t("features.itWallet.card.status.pending"),
    customIconProps: { iconColor: "info-700", iconName: "infoFilled" }
  }
};

const transparentBorderColor = "transparent";

const borderColorByStatus: { [key in ItwCredentialStatus]: string } = {
  valid: transparentBorderColor,
  expired: IOColors["error-600"],
  expiring: IOColors["warning-700"],
  pending: IOColors["info-700"]
};

const styles = StyleSheet.create({
  previewContainer: {
    aspectRatio: 9 / 2,
    overflow: "hidden"
  },
  cardContainer: {
    aspectRatio: 16 / 10,
    borderRadius: 8,
    overflow: "hidden"
  },
  card: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: IOColors["grey-100"]
  },
  cardBackground: { height: "100%", width: "100%" },
  border: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderRadius: 8,
    borderWidth: 1,
    borderLeftWidth: 9,
    borderColor: transparentBorderColor
  },
  infoContainer: {
    paddingHorizontal: 16,
    paddingTop: 14
  },
  header: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  digitalVersionBadge: { position: "absolute", bottom: 16, right: -10 }
});
