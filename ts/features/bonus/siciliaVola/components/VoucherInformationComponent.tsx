import React from "react";
import { Image, StyleSheet } from "react-native";
import { View } from "native-base";
import I18n from "../../../../i18n";
import { H5 } from "../../../../components/core/typography/H5";
import { H3 } from "../../../../components/core/typography/H3";
import CopyButtonComponent from "../../../../components/CopyButtonComponent";
import { withBase64Uri } from "../../../../utils/image";
import { IOStyles } from "../../../../components/core/variables/IOStyles";

type Props = {
  voucherCode: string;
  qrCode: string;
  barCode: string;
  onPressWithGestureHandler?: true;
};

const styles = StyleSheet.create({
  qrCode: {
    width: 249,
    height: 249
  },
  barCode: {
    width: 249,
    height: 70
  },
  centerContentRow: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center"
  }
});

const VoucherInformationComponent = (props: Props): React.ReactElement => (
  <>
    <H5 weight={"Regular"}>
      {I18n.t("bonus.sv.components.voucherVisualDetails.uniqueCode")}
    </H5>
    <View spacer small />
    <View
      style={{
        flex: 1,
        flexDirection: "row"
      }}
    >
      <H3 color={"bluegreyDark"} style={IOStyles.flex}>
        {props.voucherCode}
      </H3>
      <View hspacer />
      <CopyButtonComponent
        textToCopy={props.voucherCode}
        onPressWithGestureHandler={props.onPressWithGestureHandler}
      />
    </View>
    <View spacer />
    <H5 weight={"Regular"}>
      {I18n.t("bonus.sv.components.voucherVisualDetails.qrCode")}
    </H5>
    <View style={styles.centerContentRow}>
      <Image
        accessible={true}
        accessibilityRole={"image"}
        accessibilityLabel={I18n.t(
          "bonus.sv.components.voucherVisualDetails.qrCode"
        )}
        source={{
          uri: withBase64Uri(props.qrCode, "png")
        }}
        style={styles.qrCode}
      />
    </View>
    <H5 weight={"Regular"}>
      {I18n.t("bonus.sv.components.voucherVisualDetails.barCode")}
    </H5>
    <View spacer />
    <View style={styles.centerContentRow}>
      <Image
        accessible={true}
        accessibilityRole={"image"}
        accessibilityLabel={I18n.t(
          "bonus.sv.components.voucherVisualDetails.barCode"
        )}
        source={{
          uri: withBase64Uri(props.barCode, "png")
        }}
        style={styles.barCode}
      />
    </View>
  </>
);

export default VoucherInformationComponent;
