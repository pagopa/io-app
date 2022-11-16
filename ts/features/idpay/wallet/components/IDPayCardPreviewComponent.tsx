
import I18n from "i18n-js";
import { View } from "native-base";
import React from "react";
import { StyleSheet } from "react-native";
import { H2 } from "../../../../components/core/typography/H2";
import { H5 } from "../../../../components/core/typography/H5";
import TouchableDefaultOpacity from "../../../../components/TouchableDefaultOpacity";
import { localeDateFormat } from "../../../../utils/locale";
import { widthPercentageToDP } from "react-native-responsive-screen";

type Props = {
  initiativeId: string;
  initiativeName?: string;
  endDate: Date;
  availableAmount?: number;
  onPress?: () => void;
};


const styles = StyleSheet.create({
  paddedContentPreview: {
    paddingLeft: 18,
    paddingTop: 8,
    paddingRight: 22
  },
  row: {
    flexDirection: "row"
  },
  spaced: {
    justifyContent: "space-between"
  },
  column: {
    flexDirection: "column"
  },
  alignItemsCenter: {
    alignItems: "center"
  }
});

const IDPayCardPreviewComponent = (props: Props) => (
  <TouchableDefaultOpacity
    style={[styles.row, styles.spaced, styles.paddedContentPreview]}
    onPress={props.onPress}
    accessible={true}
    accessibilityRole={"button"}
  >
    <View
        style={[styles.column, { width: widthPercentageToDP("60%") }]}
        accessible={false}
        accessibilityElementsHidden={true}
        importantForAccessibility={"no-hide-descendants"}
      >
    <View style={[styles.row, styles.alignItemsCenter, styles.spaced]}>
      <H5 color={"white"} weight={"Regular"}>
        {I18n.t("idpay.wallet.preview.validThrough", {
          endDate: localeDateFormat(
            props.endDate,
            I18n.t("global.dateFormats.shortFormat")
          )
        })}
      </H5>
    </View>
    <View style={[styles.row, styles.alignItemsCenter, styles.spaced]}>
      <H2 weight={"Bold"} color={"white"}>
        {props.initiativeName}
      </H2>
    </View>
    </View>
  </TouchableDefaultOpacity>
);

export default IDPayCardPreviewComponent;
