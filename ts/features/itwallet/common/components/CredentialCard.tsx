import { Badge, Body, IOColors, Tag } from "@pagopa/io-app-design-system";
import React from "react";
import { StyleSheet, View } from "react-native";
import { SvgProps } from "react-native-svg";
import EidCardShape from "../../../../../img/features/itWallet/eid_card.svg";
import EidCardInvalidShape from "../../../../../img/features/itWallet/eid_card_invalid.svg";
import I18n from "../../../../i18n";
import { CredentialType } from "../utils/itwMocksUtils";

export type CredentialStatus = "valid" | "pending" | "expired";

type PreviewProps = {
  isPreview: true;
  data?: never;
};

type DataProps = {
  isPreview?: false;
  data: ReadonlyArray<string>;
};

type BaseProps = {
  type: CredentialType;
  isMasked?: boolean;
  status?: CredentialStatus;
};

export type CredentialCardProps = BaseProps & (PreviewProps | DataProps);

const credentialCardShapes: Record<
  CredentialType,
  [React.FC<SvgProps>, React.FC<SvgProps>]
> = {
  EuropeanDisabilityCard: [EidCardShape, EidCardInvalidShape],
  EuropeanHealthInsuranceCard: [EidCardShape, EidCardInvalidShape],
  mDL: [EidCardShape, EidCardInvalidShape],
  PersonIdentificationData: [EidCardShape, EidCardInvalidShape]
};

export const CredentialCard = ({
  isMasked = false,
  status = "valid",
  type,
  ...props
}: CredentialCardProps) => {
  const isValid = status === "valid";
  const shouldDisplayData = !(!isValid || isMasked) && !props.isPreview;
  const labelColor: IOColors = isValid ? "bluegreyDark" : "grey-700";

  const CardShape = credentialCardShapes[type][isValid ? 0 : 1];

  return (
    <View style={props.isPreview && styles.previewContainer}>
      <View style={styles.cardContainer}>
        <View style={styles.card}>
          <CardShape />
        </View>
        <View style={styles.infoContainer}>
          <View style={styles.header}>
            <Body color={labelColor} weight="SemiBold">
              {I18n.t("features.itWallet.card.eid.label").toUpperCase()}
            </Body>
            <CredentialStatusTag status={status} />
          </View>
          {shouldDisplayData && <CredentialData {...props} />}
        </View>
        {!isValid && <DigitalVersionBadge />}
        <View
          style={[
            styles.border,
            status === "expired" && styles.expiredBorder,
            status === "pending" && styles.pendingBorder
          ]}
        />
      </View>
    </View>
  );
};

const CredentialData = ({ data }: DataProps) => (
  <View style={styles.personalInfo}>
    {data.map(value => (
      <Body
        color="bluegreyDark"
        weight="SemiBold"
        key={`credential_data_${value}`}
      >
        {value}
      </Body>
    ))}
  </View>
);

const CredentialStatusTag = ({
  status
}: Pick<CredentialCardProps, "status">) => {
  if (status === "expired") {
    return (
      <Tag
        variant="error"
        text={I18n.t("features.itWallet.card.eid.expired")}
      />
    );
  }

  if (status === "pending") {
    return (
      <Tag
        variant="customIcon"
        text={I18n.t("features.itWallet.card.eid.pending")}
        customIconProps={{ iconColor: "info-700", iconName: "infoFilled" }}
      />
    );
  }

  return null;
};

const DigitalVersionBadge = () => (
  <View style={styles.digitalVersionBadge}>
    <Badge
      // The space at the end is an hack to have extra padding inside the badge text
      text={`${I18n.t("features.itWallet.card.eid.digital")}   `}
      variant="default"
    />
  </View>
);

const transparentBorderColor = "transparent";

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
  digitalVersionBadge: { position: "absolute", bottom: 16, right: -10 },
  personalInfo: {
    marginTop: 65
  }
});
