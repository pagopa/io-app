import * as React from "react";
import { View, StyleSheet } from "react-native";
import { H4 } from "../../../../../../components/core/typography/H4";
import I18n from "../../../../../../i18n";
import IconFont from "../../../../../../components/ui/IconFont";
import { IOColors } from "../../../../../../components/core/variables/IOColors";
import ButtonDefaultOpacity from "../../../../../../components/ButtonDefaultOpacity";
import { Label } from "../../../../../../components/core/typography/Label";
import { InfoBox } from "../../../../../../components/box/InfoBox";
import { openWebUrl } from "../../../../../../utils/url";
import { showToast } from "../../../../../../utils/showToast";
import { VSpacer } from "../../../../../../components/core/spacer/Spacer";
import { Icon } from "../../../../../../components/core/icons/Icon";

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
      <ButtonDefaultOpacity onPress={props.openBottomSheet} transparent={true}>
        <Icon name="info" size={ICON_SIZE} color="blue" />
      </ButtonDefaultOpacity>
    </View>
    <VSpacer size={16} />
    <InfoBox iconName="info" alignedCentral iconSize={32}>
      <H4 weight={"Regular"}>
        {I18n.t("bonus.cgn.detail.status.eycaPending")}
      </H4>
    </InfoBox>
    <VSpacer size={16} />
    <ButtonDefaultOpacity
      bordered
      style={{ width: "100%" }}
      onPress={() =>
        openWebUrl(EYCA_URL, () =>
          showToast(I18n.t("bonus.cgn.generic.linkError"))
        )
      }
      testID={"eyca-pending-button"}
    >
      <Label color={"blue"}>
        {I18n.t("bonus.cgn.detail.cta.eyca.pending")}
      </Label>
    </ButtonDefaultOpacity>
  </>
);

export default EycaStatusDetailsComponent;
