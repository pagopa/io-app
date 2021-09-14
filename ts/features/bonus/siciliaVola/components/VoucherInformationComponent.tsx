import React from "react";
import I18n from "../../../../i18n";
import { Image, StyleSheet } from "react-native";
import { H5 } from "../../../../components/core/typography/H5";
import { View } from "native-base";
import { H3 } from "../../../../components/core/typography/H3";
import CopyButtonComponent from "../../../../components/CopyButtonComponent";

type Props = {
  voucherCode: string;
  qrCode: string;
  barCode: string;
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

const VoucherInformationComponent = (props: Props): React.ReactElement => {
  return (
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
        <H3 color={"bluegreyDark"}>{props.voucherCode}</H3>
        <View hspacer />
        <CopyButtonComponent
          textToCopy={props.voucherCode}
          onPressWithGestureHandler={true}
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
            uri: `data:image/png;base64,${props.qrCode}`
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
            uri: `data:image/png;base64,${props.barCode}`
          }}
          style={styles.barCode}
        />
      </View>
    </>
  );
};

export default VoucherInformationComponent;
