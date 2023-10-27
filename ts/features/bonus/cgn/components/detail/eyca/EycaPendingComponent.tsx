import * as React from "react";
import { View, StyleSheet } from "react-native";
import { ButtonOutline, Icon, VSpacer } from "@pagopa/io-app-design-system";
import { H4 } from "../../../../../../components/core/typography/H4";
import I18n from "../../../../../../i18n";
import { InfoBox } from "../../../../../../components/box/InfoBox";
import { openWebUrl } from "../../../../../../utils/url";
import TouchableDefaultOpacity from "../../../../../../components/TouchableDefaultOpacity";
import { EYCA_WEBSITE_DISCOUNTS_PAGE_URL } from "../../../utils/constants";
import { IOToast } from "../../../../../../components/Toast";

type Props = {
  openBottomSheet: () => void;
};

const styles = StyleSheet.create({
  rowBlock: {
    flexDirection: "row"
  },
  spaced: {
    justifyContent: "space-between"
  }
});

const ICON_SIZE = 24;

// Component that informs the user that the EYCA card requested is still in progress
const EycaStatusDetailsComponent = (props: Props) => (
  <>
    <View
      style={[styles.rowBlock, styles.spaced]}
      testID={"eyca-pending-component"}
    >
      <H4>{I18n.t("bonus.cgn.detail.status.eycaCircuit")}</H4>
      <TouchableDefaultOpacity onPress={props.openBottomSheet}>
        <Icon name="info" size={ICON_SIZE} color="blue" />
      </TouchableDefaultOpacity>
    </View>
    <VSpacer size={16} />
    <InfoBox iconName="info" alignedCentral iconSize={32}>
      <H4 weight={"Regular"}>
        {I18n.t("bonus.cgn.detail.status.eycaPending")}
      </H4>
    </InfoBox>
    <VSpacer size={16} />
    <ButtonOutline
      fullWidth
      onPress={() =>
        openWebUrl(EYCA_WEBSITE_DISCOUNTS_PAGE_URL, () =>
          IOToast.error(I18n.t("bonus.cgn.generic.linkError"))
        )
      }
      label={I18n.t("bonus.cgn.detail.cta.eyca.pending")}
      accessibilityLabel={I18n.t("bonus.cgn.detail.cta.eyca.pending")}
      testID="eyca-pending-button"
    />
  </>
);

export default EycaStatusDetailsComponent;
