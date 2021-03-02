import * as React from "react";
import { Badge, View } from "native-base";
import { StyleSheet } from "react-native";
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

type Props = {
  eycaCard: EycaCardActivated | EycaCardExpired | EycaCardRevoked;
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

const EycaStatusDetailsComponent: React.FunctionComponent<Props> = (
  props: Props
) => {
  const badgeByStatus = () => {
    switch (props.eycaCard.status) {
      case "ACTIVATED":
        return (
          <Badge style={[styles.statusBadgeActive]}>
            <H5
              weight={"SemiBold"}
              color={"bluegreyDark"}
              style={styles.statusBadgeText}
            >
              {I18n.t("bonus.cgn.detail.status.badge.active")}
            </H5>
          </Badge>
        );
      case "REVOKED":
        return (
          <Badge style={[styles.statusBadgeExpired]}>
            <H5
              weight={"SemiBold"}
              color={"white"}
              style={styles.statusBadgeText}
            >
              {I18n.t("bonus.cgn.detail.status.badge.revoked")}
            </H5>
          </Badge>
        );
      case "EXPIRED":
        return (
          <Badge style={[styles.statusBadgeExpired]}>
            <H5
              weight={"SemiBold"}
              color={"white"}
              style={styles.statusBadgeText}
            >
              {I18n.t("bonus.cgn.detail.status.badge.expired")}
            </H5>
          </Badge>
        );
      default:
        return <></>;
    }
  };
  return (
    <>
      <View style={[styles.rowBlock, styles.spaced]}>
        <View style={styles.rowBlock}>
          <H4>{I18n.t("bonus.cgn.detail.status.eyca")}</H4>
          <View hspacer small />
          <IconFont name={"io-info"} size={ICON_SIZE} color={IOColors.blue} />
        </View>
        {badgeByStatus()}
      </View>
      <View spacer />
      <View style={[styles.rowBlock, styles.spaced]}>
        <H5 weight={"Regular"} color={"bluegrey"} style={IOStyles.flex}>
          {I18n.t("bonus.cgn.detail.status.eycaNumber")}
        </H5>
        <Monospace>{props.eycaCard.card_number}</Monospace>
      </View>
      <View spacer small />
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
    </>
  );
};

export default EycaStatusDetailsComponent;
