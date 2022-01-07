import * as React from "react";
import { View } from "native-base";
import { StyleSheet } from "react-native";
import { lookup } from "fp-ts/lib/Array";
import {
  bottomSheetContent,
  useIOBottomSheetRaw
} from "../../../../../utils/bottomSheet";
import I18n from "../../../../../i18n";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import { H3 } from "../../../../../components/core/typography/H3";
import { H5 } from "../../../../../components/core/typography/H5";
import { H4 } from "../../../../../components/core/typography/H4";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import { Discount } from "../../../../../../definitions/cgn/merchants/Discount";
import { getCategorySpecs } from "../../utils/filters";
import ButtonDefaultOpacity from "../../../../../components/ButtonDefaultOpacity";
import { Label } from "../../../../../components/core/typography/Label";
import { DiscountCodeType } from "../../../../../../definitions/cgn/merchants/DiscountCodeType";
import CgnDiscountValueBox from "./CgnDiscountValueBox";
import CgnDiscountCodeComponent from "./discount/CgnDiscountCodeComponent";

type Props = {
  discount: Discount;
  merchantType?: DiscountCodeType;
  onLandingCtaPress?: (url: string, referer: string) => void;
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
  },
  codeContainer: { alignItems: "center", justifyContent: "space-between" },
  codeText: {
    fontSize: 20
  },
  flexEnd: { alignSelf: "flex-end" },
  discountValue: { textAlign: "center", lineHeight: 30 }
});

const CATEGORY_ICON_SIZE = 22;

const CgnDiscountDetail: React.FunctionComponent<Props> = ({
  discount,
  merchantType,
  onLandingCtaPress
}: Props) => (
  <View style={styles.container}>
    {lookup(0, [...discount.productCategories]).fold(undefined, categoryKey =>
      getCategorySpecs(categoryKey).fold(undefined, c => (
        <View style={styles.row}>
          {c.icon({
            height: CATEGORY_ICON_SIZE,
            width: CATEGORY_ICON_SIZE,
            fill: IOColors.bluegrey
          })}
          <View hspacer small />
          <H5 weight={"SemiBold"} color={"bluegrey"}>
            {I18n.t(c.nameKey).toLocaleUpperCase()}
          </H5>
        </View>
      ))
    )}
    <View spacer />
    <H3 accessible={true} accessibilityRole={"header"}>
      {I18n.t("bonus.cgn.merchantDetail.title.description")}
    </H3>
    <H4 weight={"Regular"}>{discount.description}</H4>
    <View spacer />
    <H3 accessible={true} accessibilityRole={"header"}>
      {I18n.t("bonus.cgn.merchantDetail.title.validity")}
    </H3>
    <H4 weight={"Regular"}>{discount.description}</H4>
    <CgnDiscountCodeComponent discount={discount} merchantType={merchantType} />
    <View spacer />
    {discount.condition && (
      <>
        <H3 accessible={true} accessibilityRole={"header"}>
          {I18n.t("bonus.cgn.merchantDetail.title.conditions")}
        </H3>
        <H4 weight={"Regular"}>{discount.condition}</H4>
        <View spacer />
      </>
    )}
    {discount.landingPageUrl && discount.landingPageReferrer && (
      <ButtonDefaultOpacity
        style={{ width: "100%" }}
        onPress={() => {
          onLandingCtaPress?.(
            discount.landingPageUrl as string,
            discount.landingPageReferrer as string
          );
        }}
        onPressWithGestureHandler={true}
      >
        <Label color={"white"}>
          {I18n.t("bonus.cgn.merchantDetail.cta.landingPage")}
        </Label>
      </ButtonDefaultOpacity>
    )}
  </View>
);

const CgnDiscountDetailHeader = ({ discount }: Pick<Props, "discount">) => (
  <View style={[IOStyles.row, { alignItems: "center" }, IOStyles.flex]}>
    {discount.discount && (
      <>
        <CgnDiscountValueBox value={discount.discount} small />
        <View hspacer />
      </>
    )}
    <H3 style={IOStyles.flex}>{discount.name}</H3>
  </View>
);

export const useCgnDiscountDetailBottomSheet = (
  discount: Discount,
  merchantType?: DiscountCodeType,
  landingPageHandler?: (url: string, referer: string) => void
) => {
  const { present: openBottomSheet, dismiss } = useIOBottomSheetRaw(
    440,
    bottomSheetContent
  );

  return {
    dismiss,
    present: () =>
      openBottomSheet(
        <CgnDiscountDetail
          discount={discount}
          merchantType={merchantType}
          onLandingCtaPress={(url: string, referer: string) => {
            landingPageHandler?.(url, referer);
            dismiss();
          }}
        />,
        <CgnDiscountDetailHeader discount={discount} />
      )
  };
};
