import { Badge, Body, IOColors, Tag } from "@pagopa/io-app-design-system";
import React from "react";
import { StyleSheet, View } from "react-native";
import EidCardShape from "../../../../../img/features/itWallet/eid_card.svg";
import EidCardInvalidShape from "../../../../../img/features/itWallet/eid_card_invalid.svg";
import I18n from "../../../../i18n";

export type EidStatus = "valid" | "pending" | "expired";

export type EidCardProps = {
  isPreview?: boolean;
  isMasked?: boolean;
  status?: EidStatus;
  name?: string;
  fiscalCode?: string;
};

export const EidCard = ({
  status = "valid",
  isMasked = false,
  name,
  fiscalCode
}: EidCardProps) => {
  const isValid = status === "valid";
  const isExpired = status === "expired";
  const isPending = status === "pending";

  const shouldDisplayPersonalInfo = !(!isValid || isMasked);

  const personalInfoComponent = (
    <View style={styles.personalInfo}>
      <Body color="bluegreyDark" weight="SemiBold">
        {name}
      </Body>
      <Body color="bluegreyDark" weight="SemiBold">
        {fiscalCode}
      </Body>
    </View>
  );

  const tagComponent = React.useMemo(() => {
    if (status === "expired") {
      return (
        <Tag
          variant="error"
          text={I18n.t("features.itWallet.card.eid.expired")}
        />
      );
    } else if (status === "pending") {
      return (
        <Tag
          variant="customIcon"
          text={I18n.t("features.itWallet.card.eid.pending")}
          customIconProps={{ iconColor: "info-700", iconName: "infoFilled" }}
        />
      );
    }

    return null;
  }, [status]);

  const labelColor: IOColors = isValid ? "bluegreyDark" : "grey-700";

  const digitalVersionBadge = (
    <View style={{ position: "absolute", bottom: 16, right: -10 }}>
      <Badge
        // The space at the end is an hack to have extra padding inside the badge text
        text={`${I18n.t("features.itWallet.card.eid.digital")}   `}
        variant="default"
      />
    </View>
  );

  return (
    <View style={styles.cardContainer}>
      <View style={styles.card}>
        {isValid ? <EidCardShape /> : <EidCardInvalidShape />}
      </View>
      <View style={styles.infoContainer}>
        <View style={styles.header}>
          <Body color={labelColor} weight="SemiBold">
            {I18n.t("features.itWallet.card.eid.label").toUpperCase()}
          </Body>
          {tagComponent}
        </View>
        {shouldDisplayPersonalInfo && personalInfoComponent}
      </View>
      {!isValid && digitalVersionBadge}
      <View
        style={[
          styles.border,
          isExpired && styles.expiredBorder,
          isPending && styles.pendingBorder
        ]}
      />
    </View>
  );
};

const transparentBorderColor = "transparent";

const styles = StyleSheet.create({
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
  expiredBorder: {
    borderColor: IOColors["error-600"]
  },
  pendingBorder: {
    borderColor: IOColors["info-700"]
  },
  infoContainer: {
    paddingHorizontal: 16,
    paddingTop: 12
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  personalInfo: {
    marginTop: 65
  }
});
