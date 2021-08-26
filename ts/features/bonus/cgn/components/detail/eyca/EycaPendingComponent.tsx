import * as React from "react";
import { View } from "native-base";
import { StyleSheet } from "react-native";
import { H4 } from "../../../../../../components/core/typography/H4";
import I18n from "../../../../../../i18n";
import IconFont from "../../../../../../components/ui/IconFont";
import { IOColors } from "../../../../../../components/core/variables/IOColors";
import ButtonDefaultOpacity from "../../../../../../components/ButtonDefaultOpacity";
import { Label } from "../../../../../../components/core/typography/Label";
import { InfoBox } from "../../../../../../components/box/InfoBox";
import { openWebUrl } from "../../../../../../utils/url";

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
const EYCA_URL = "https://www.eyca.org";

// Component that informs the user that the EYCA card requested is still in progress
const EycaStatusDetailsComponent = (props: Props) => (
  <>
    <View
      style={[styles.rowBlock, styles.spaced]}
      testID={"eyca-pending-component"}
    >
      <H4>{I18n.t("bonus.cgn.detail.status.eycaCircuit")}</H4>
      <IconFont
        name={"io-info"}
        size={ICON_SIZE}
        color={IOColors.blue}
        onPress={props.openBottomSheet}
      />
    </View>
    <View spacer />
    <InfoBox iconName={"io-info"} alignedCentral iconSize={32}>
      <H4 weight={"Regular"}>
        {I18n.t("bonus.cgn.detail.status.eycaPending")}
      </H4>
    </InfoBox>
    <View spacer />
    <ButtonDefaultOpacity
      bordered
      style={{ width: "100%" }}
      onPress={() => openWebUrl(EYCA_URL)}
      testID={"eyca-pending-button"}
    >
      <Label color={"blue"}>
        {I18n.t("bonus.cgn.detail.cta.eyca.pending")}
      </Label>
    </ButtonDefaultOpacity>
  </>
);

export default EycaStatusDetailsComponent;
