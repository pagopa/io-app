import * as React from "react";
import { View } from "native-base";
import { StyleSheet } from "react-native";
import { TmpDiscountType } from "../../__mock__/availableMerchantDetail";
import { useIOBottomSheet } from "../../../../../utils/bottomSheet";
import I18n from "../../../../../i18n";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import { H3 } from "../../../../../components/core/typography/H3";
import { H5 } from "../../../../../components/core/typography/H5";
import { H4 } from "../../../../../components/core/typography/H4";
import IconFont from "../../../../../components/ui/IconFont";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import { Monospace } from "../../../../../components/core/typography/Monospace";
import { ShadowBox } from "../../../bpd/screens/details/components/summary/base/ShadowBox";
import ButtonDefaultOpacity from "../../../../../components/ButtonDefaultOpacity";
import { clipboardSetStringWithFeedback } from "../../../../../utils/clipboard";

type Props = {
  discount: TmpDiscountType;
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row"
  },
  verticalPadding: {
    paddingBottom: 16
  },
  discountValueBox: {
    borderRadius: 6.5,
    paddingVertical: 5,
    width: 40,
    textAlign: "center",
    backgroundColor: "#EB9505"
  },
  container: {
    paddingTop: 16
  }
});

const PERCENTAGE_SYMBOL = "%";

const CgnDiscountDetail: React.FunctionComponent<Props> = ({
  discount
}: Props) => (
  <View style={styles.container}>
    <View style={IOStyles.row}>
      {/* TODO when available and defined the icon name should be defined through a map of category codes */}
      <IconFont name={"io-theater"} size={22} color={IOColors.bluegrey} />
      <View hspacer small />
      <H5 weight={"SemiBold"} color={"bluegrey"}>
        {discount.category.toLocaleUpperCase()}
      </H5>
    </View>
    <View spacer />
    <H3>{I18n.t("bonus.cgn.merchantDetail.title.description")}</H3>
    <H4 weight={"Regular"}>{discount.description}</H4>
    <View spacer />
    <H3>{I18n.t("bonus.cgn.merchantDetail.title.validity")}</H3>
    <H4 weight={"Regular"}>{discount.validityDescription}</H4>
    {discount.discountCode !== undefined && (
      <>
        <View spacer small />
        <H3>{I18n.t("bonus.cgn.merchantDetail.title.discountCode")}</H3>
        <ShadowBox>
          <ButtonDefaultOpacity
            onPress={() =>
              discount.discountCode &&
              clipboardSetStringWithFeedback(discount.discountCode)
            }
            onPressWithGestureHandler
            style={{
              backgroundColor: "rgba(52, 52, 52, 0)"
            }}
          >
            <View
              style={[
                IOStyles.row,
                { alignItems: "center", justifyContent: "space-between" }
              ]}
            >
              <View style={[IOStyles.row, { alignItems: "center" }]}>
                <IconFont name={"io-bonus"} color={IOColors.blue} size={24} />
                <View hspacer />
                <Monospace weight={"Bold"}>{discount.discountCode}</Monospace>
              </View>
              <IconFont
                name={"io-copy"}
                size={24}
                color={IOColors.blue}
                style={{ alignSelf: "flex-end" }}
              />
            </View>
          </ButtonDefaultOpacity>
        </ShadowBox>
      </>
    )}
    <View spacer />
    <H3>{I18n.t("bonus.cgn.merchantDetail.title.conditions")}</H3>
    <H4 weight={"Regular"}>{discount.conditions}</H4>
  </View>
);

const CgnDiscountDetailHeader: React.FunctionComponent<Props> = ({
  discount
}: Props) => (
  <View style={[IOStyles.row, { alignItems: "center" }]}>
    <View style={styles.discountValueBox}>
      <H4
        weight={"Bold"}
        color={"white"}
        style={{ textAlign: "center", lineHeight: 30 }}
      >
        {`${discount.value}`}
        <H5 weight={"SemiBold"} color={"white"}>
          {PERCENTAGE_SYMBOL}
        </H5>
      </H4>
    </View>
    <View hspacer />
    <H3>{discount.title}</H3>
  </View>
);

export const useCgnDiscountDetailBottomSheet = (discount: TmpDiscountType) =>
  useIOBottomSheet(
    <CgnDiscountDetail {...{ discount }} />,
    <CgnDiscountDetailHeader {...{ discount }} />,
    520
  );
