import * as React from "react";
import { View, StyleSheet } from "react-native";
import {
  Icon,
  IconButton,
  HSpacer,
  VSpacer,
  IOSpacingScale,
  IOToast,
  Badge,
  ButtonOutline
} from "@pagopa/io-app-design-system";
import { EycaCardActivated } from "../../../../../../../definitions/cgn/EycaCardActivated";
import { EycaCardExpired } from "../../../../../../../definitions/cgn/EycaCardExpired";
import { EycaCardRevoked } from "../../../../../../../definitions/cgn/EycaCardRevoked";

import { H4 } from "../../../../../../components/core/typography/H4";
import I18n from "../../../../../../i18n";
import { IOStyles } from "../../../../../../components/core/variables/IOStyles";
import { Monospace } from "../../../../../../components/core/typography/Monospace";
import { H5 } from "../../../../../../components/core/typography/H5";
import { localeDateFormat } from "../../../../../../utils/locale";
import { clipboardSetStringWithFeedback } from "../../../../../../utils/clipboard";
import TouchableDefaultOpacity from "../../../../../../components/TouchableDefaultOpacity";
import { openWebUrl } from "../../../../../../utils/url";
import { EYCA_WEBSITE_DISCOUNTS_PAGE_URL } from "../../../utils/constants";

type Props = {
  eycaCard: EycaCardActivated | EycaCardExpired | EycaCardRevoked;
  openBottomSheet: () => void;
};

const CARD_PADDING_END: IOSpacingScale = 6;
const ICON_SIZE = 24;

const styles = StyleSheet.create({
  spaced: {
    justifyContent: "space-between"
  },
  cardNumber: {
    paddingEnd: CARD_PADDING_END
  }
});

// this component shows EYCA card details related to user's CGN
const EycaStatusDetailsComponent = (props: Props) => {
  const badgeByStatus = (): React.ReactNode => {
    switch (props.eycaCard.status) {
      case "ACTIVATED":
        return (
          <Badge
            testID={"eyca-status-badge"}
            text={I18n.t("bonus.cgn.detail.status.badge.active")}
            variant="success"
          />
        );
      case "REVOKED":
        return (
          <Badge
            testID={"eyca-status-badge"}
            text={I18n.t("bonus.cgn.detail.status.badge.revoked")}
            variant="default"
          />
        );
      case "EXPIRED":
        return (
          <Badge
            testID={"eyca-status-badge"}
            text={I18n.t("bonus.cgn.detail.status.badge.expired")}
            variant="default"
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
        <View style={IOStyles.row}>
          <Monospace style={styles.cardNumber} testID={"eyca-card-number"}>
            {props.eycaCard.card_number}
          </Monospace>
          <IconButton
            icon="copy"
            onPress={() =>
              clipboardSetStringWithFeedback(props.eycaCard.card_number)
            }
            accessibilityLabel={I18n.t("bonus.cgn.detail.cta.eyca.copy")}
          />
        </View>
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
      <ButtonOutline
        fullWidth
        label={I18n.t("bonus.cgn.detail.cta.eyca.showEycaDiscounts")}
        accessibilityLabel={I18n.t(
          "bonus.cgn.detail.cta.eyca.showEycaDiscounts"
        )}
        onPress={() =>
          openWebUrl(EYCA_WEBSITE_DISCOUNTS_PAGE_URL, () =>
            IOToast.error(I18n.t("bonus.cgn.generic.linkError"))
          )
        }
      />
    </>
  );
};

export default EycaStatusDetailsComponent;
