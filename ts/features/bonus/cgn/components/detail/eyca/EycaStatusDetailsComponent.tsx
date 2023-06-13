import * as React from "react";
import { View, StyleSheet } from "react-native";
import { EycaCardActivated } from "../../../../../../../definitions/cgn/EycaCardActivated";
import { H4 } from "../../../../../../components/core/typography/H4";
import I18n from "../../../../../../i18n";
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
import TouchableDefaultOpacity from "../../../../../../components/TouchableDefaultOpacity";
import { IOBadge } from "../../../../../../components/core/IOBadge";
import { openWebUrl } from "../../../../../../utils/url";
import { EYCA_DISCOUNTS_URL } from "../../../utils/constants";
import { showToast } from "../../../../../../utils/showToast";

type Props = {
  eycaCard: EycaCardActivated | EycaCardExpired | EycaCardRevoked;
  openBottomSheet: () => void;
};

const styles = StyleSheet.create({
  spaced: {
    justifyContent: "space-between"
  }
});

const ICON_SIZE = 24;

// this component shows EYCA card details related to user's CGN
const EycaStatusDetailsComponent = (props: Props) => {
  const badgeByStatus = (): React.ReactNode => {
    switch (props.eycaCard.status) {
      case "ACTIVATED":
        return (
          <IOBadge
            testID={"eyca-status-badge"}
            labelTestID={"eyca-status-label"}
            text={I18n.t("bonus.cgn.detail.status.badge.active")}
            variant="solid"
            color="aqua"
          />
        );
      case "REVOKED":
        return (
          <IOBadge
            testID={"eyca-status-badge"}
            labelTestID={"eyca-status-label"}
            text={I18n.t("bonus.cgn.detail.status.badge.revoked")}
            variant="solid"
            color="grey"
          />
        );
      case "EXPIRED":
        return (
          <IOBadge
            testID={"eyca-status-badge"}
            labelTestID={"eyca-status-label"}
            text={I18n.t("bonus.cgn.detail.status.badge.expired")}
            variant="solid"
            color="grey"
          />
        );
      default:
        return null;
    }
  };
  return (
    <>
      <View style={[IOStyles.row, styles.spaced]}>
        <View style={IOStyles.row}>
          <H4>{I18n.t("bonus.cgn.detail.status.eyca")}</H4>
          <HSpacer size={8} />
          <TouchableDefaultOpacity onPress={props.openBottomSheet}>
            <Icon name="info" size={ICON_SIZE} color="blue" />
          </TouchableDefaultOpacity>
        </View>
        {badgeByStatus()}
      </View>
      <VSpacer size={16} />
      <View style={[IOStyles.row, styles.spaced]}>
        <H5 weight={"Regular"} color={"bluegrey"} style={IOStyles.flex}>
          {I18n.t("bonus.cgn.detail.status.eycaNumber")}
        </H5>
        <Monospace testID={"eyca-card-number"}>
          {props.eycaCard.card_number}
        </Monospace>
      </View>
      <VSpacer size={8} />
      <View style={[IOStyles.row, styles.spaced]}>
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
          openWebUrl(EYCA_DISCOUNTS_URL, () =>
            showToast(I18n.t("bonus.cgn.generic.linkError"))
          )
        }
      >
        <Label color={"blue"}>
          {I18n.t("bonus.cgn.detail.cta.eyca.showEycaDiscounts")}
        </Label>
      </ButtonDefaultOpacity>
    </>
  );
};

export default EycaStatusDetailsComponent;
