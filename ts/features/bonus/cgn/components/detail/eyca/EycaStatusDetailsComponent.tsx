import * as React from "react";
import { Badge } from "native-base";
import { View, ViewStyle, StyleProp, StyleSheet } from "react-native";
import { EycaCardActivated } from "../../../../../../../definitions/cgn/EycaCardActivated";
import { H4 } from "../../../../../../components/core/typography/H4";
import I18n from "../../../../../../i18n";
import IconFont from "../../../../../../components/ui/IconFont";
import { IOColors } from "../../../../../../components/core/variables/IOColors";
import { IOStyles } from "../../../../../../components/core/variables/IOStyles";
import { Monospace } from "../../../../../../components/core/typography/Monospace";
import { EycaCardExpired } from "../../../../../../../definitions/cgn/EycaCardExpired";
import { EycaCardRevoked } from "../../../../../../../definitions/cgn/EycaCardRevoked";
import { H5 } from "../../../../../../components/core/typography/H5";
import { localeDateFormat } from "../../../../../../utils/locale";
import ButtonDefaultOpacity from "../../../../../../components/ButtonDefaultOpacity";
import { Label } from "../../../../../../components/core/typography/Label";
import { clipboardSetStringWithFeedback } from "../../../../../../utils/clipboard";
import {
  HSpacer,
  VSpacer
} from "../../../../../../components/core/spacer/Spacer";
import { Icon } from "../../../../../../components/core/icons/Icon";

type Props = {
  eycaCard: EycaCardActivated | EycaCardExpired | EycaCardRevoked;
  openBottomSheet: () => void;
};

const styles = StyleSheet.create({
  rowBlock: {
    flexDirection: "row"
  },
  spaced: {
    justifyContent: "space-between"
  },
  statusBadgeActive: {
    height: 20,
    marginTop: 2,
    backgroundColor: IOColors.aqua
  },
  statusBadgeExpired: {
    height: 20,
    marginTop: 2,
    backgroundColor: IOColors.bluegrey
  },
  statusBadgeText: { paddingHorizontal: 8 }
});

const ICON_SIZE = 24;

type BadgeProps = {
  text: string;
  badgeStyle: StyleProp<ViewStyle>;
  textColor: "bluegreyDark" | "white";
};

const EycaStatusBadge = ({ text, badgeStyle, textColor }: BadgeProps) => (
  <Badge style={badgeStyle} testID={"eyca-status-badge"}>
    <H5
      weight={"SemiBold"}
      color={textColor}
      style={styles.statusBadgeText}
      testID={"eyca-status-label"}
    >
      {text}
    </H5>
  </Badge>
);

// this component shows EYCA card details related to user's CGN
const EycaStatusDetailsComponent = (props: Props) => {
  const badgeByStatus = (): React.ReactNode => {
    switch (props.eycaCard.status) {
      case "ACTIVATED":
        return (
          <EycaStatusBadge
            text={I18n.t("bonus.cgn.detail.status.badge.active")}
            badgeStyle={styles.statusBadgeActive}
            textColor={"bluegreyDark"}
          />
        );
      case "REVOKED":
        return (
          <EycaStatusBadge
            text={I18n.t("bonus.cgn.detail.status.badge.revoked")}
            badgeStyle={styles.statusBadgeExpired}
            textColor={"white"}
          />
        );
      case "EXPIRED":
        return (
          <EycaStatusBadge
            text={I18n.t("bonus.cgn.detail.status.badge.expired")}
            badgeStyle={styles.statusBadgeExpired}
            textColor={"white"}
          />
        );
      default:
        return null;
    }
  };
  return (
    <>
      <View style={[styles.rowBlock, styles.spaced]}>
        <View style={styles.rowBlock}>
          <H4>{I18n.t("bonus.cgn.detail.status.eyca")}</H4>
          <HSpacer size={8} />
          <ButtonDefaultOpacity
            onPress={props.openBottomSheet}
            transparent={true}
          >
            <Icon name="info" size={ICON_SIZE} color="blue" />
          </ButtonDefaultOpacity>
        </View>
        {badgeByStatus()}
      </View>
      <VSpacer size={16} />
      <View style={[styles.rowBlock, styles.spaced]}>
        <H5 weight={"Regular"} color={"bluegrey"} style={IOStyles.flex}>
          {I18n.t("bonus.cgn.detail.status.eycaNumber")}
        </H5>
        <Monospace testID={"eyca-card-number"}>
          {props.eycaCard.card_number}
        </Monospace>
      </View>
      <VSpacer size={8} />
      <View style={[styles.rowBlock, styles.spaced]}>
        <H5 weight={"Regular"} color={"bluegrey"} style={IOStyles.flex}>
          {I18n.t("bonus.cgn.detail.status.expiration.eyca")}
        </H5>
        <H5 weight={"SemiBold"} color={"bluegrey"}>
          {localeDateFormat(
            props.eycaCard.expiration_date,
            I18n.t("global.dateFormats.shortFormat")
          )}
        </H5>
      </View>
      <VSpacer size={16} />
      <ButtonDefaultOpacity
        bordered
        style={{ width: "100%" }}
        onPress={() =>
          clipboardSetStringWithFeedback(props.eycaCard.card_number)
        }
      >
        <Label color={"blue"}>{I18n.t("bonus.cgn.detail.cta.eyca.copy")}</Label>
      </ButtonDefaultOpacity>
    </>
  );
};

export default EycaStatusDetailsComponent;
