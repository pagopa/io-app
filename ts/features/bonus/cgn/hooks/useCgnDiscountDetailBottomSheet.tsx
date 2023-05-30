import * as React from "react";
import { useMemo } from "react";
import { Dimensions } from "react-native";
import { Discount } from "../../../../../definitions/cgn/merchants/Discount";
import { DiscountCodeType } from "../../../../../definitions/cgn/merchants/DiscountCodeType";
import {
  CgnDiscountDetail,
  CgnDiscountDetailHeader
} from "../components/merchants/CgnDiscountDetail";
import { useLegacyIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";

const screenHeight = Dimensions.get("screen").height;
const calculateBottomSheetHeight = (
  discount: Discount,
  merchantType?: DiscountCodeType
): number =>
  Math.min(
    300 +
      discount.productCategories.length * 25 +
      (discount.description === undefined
        ? 0
        : discount.description.length * 0.75) +
      (discount.condition === undefined
        ? 0
        : discount.condition.length * 0.75) +
      (merchantType === undefined ? -50 : 0) +
      (discount.discountUrl === undefined ? 0 : 60),
    screenHeight
  );
export const useCgnDiscountDetailBottomSheet = (
  discount: Discount,
  operatorName: string,
  merchantType?: DiscountCodeType,
  landingPageHandler?: (url: string, referer: string) => void
) => {
  const height = useMemo(
    () => calculateBottomSheetHeight(discount, merchantType),
    [discount, merchantType]
  );

  const { present, bottomSheet, dismiss } = useLegacyIOBottomSheetModal(
    <CgnDiscountDetail
      discount={discount}
      merchantType={merchantType}
      operatorName={operatorName}
      onLandingCtaPress={(url: string, referer: string) => {
        landingPageHandler?.(url, referer);
        dismiss();
      }}
    />,
    <CgnDiscountDetailHeader discount={discount} />,
    height
  );

  return {
    dismiss,
    present,
    bottomSheet
  };
};
