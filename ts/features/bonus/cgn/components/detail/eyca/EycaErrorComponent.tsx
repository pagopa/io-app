import { ButtonOutline, Icon, VSpacer } from "@pagopa/io-app-design-system";
import * as React from "react";
import { StyleSheet, View } from "react-native";
import TouchableDefaultOpacity from "../../../../../../components/TouchableDefaultOpacity";
import { InfoBox } from "../../../../../../components/box/InfoBox";
import { H4 } from "../../../../../../components/core/typography/H4";
import I18n from "../../../../../../i18n";

type Props = {
  onRetry: () => void;
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

const TITLE_ICON_SIZE = 24;
const INFOBOX_ICON_SIZE = 32;

// Component that informs the user that the EYCA card request has failed
// and will give the user the opportunity to request again it's activation
const EycaErrorComponent = (props: Props) => (
  <>
    <View
      style={[styles.rowBlock, styles.spaced]}
      testID={"eyca-error-component"}
    >
      <H4>{I18n.t("bonus.cgn.detail.status.eycaCircuit")}</H4>
      <TouchableDefaultOpacity onPress={props.openBottomSheet}>
        <Icon name="info" size={TITLE_ICON_SIZE} color="blue" />
      </TouchableDefaultOpacity>
    </View>
    <VSpacer size={16} />
    <InfoBox iconName="errorFilled" alignedCentral iconSize={INFOBOX_ICON_SIZE}>
      <H4 weight={"Regular"} testID={"eyca-error-text"}>
        {I18n.t("bonus.cgn.detail.status.eycaError")}
      </H4>
    </InfoBox>
    <VSpacer size={16} />
    <ButtonOutline
      fullWidth
      accessibilityLabel={I18n.t("global.buttons.retry")}
      label={I18n.t("global.buttons.retry")}
      onPress={props.onRetry}
    />
  </>
);

export default EycaErrorComponent;
