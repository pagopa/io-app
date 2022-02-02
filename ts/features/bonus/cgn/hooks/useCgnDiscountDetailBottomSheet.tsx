import * as React from "react";
import { Discount } from "../../../../../definitions/cgn/merchants/Discount";
import { DiscountCodeType } from "../../../../../definitions/cgn/merchants/DiscountCodeType";
import {
  CgnDiscountDetail,
  CgnDiscountDetailHeader
} from "../components/merchants/CgnDiscountDetail";
import { useIOBottomSheet } from "../../../../utils/hooks/bottomSheet";

export const useCgnDiscountDetailBottomSheet = (
  discount: Discount,
  merchantType?: DiscountCodeType,
  landingPageHandler?: (url: string, referer: string) => void
) => {
  const { present, bottomSheet, dismiss } = useIOBottomSheet(
    <CgnDiscountDetail
      discount={discount}
      merchantType={merchantType}
      onLandingCtaPress={(url: string, referer: string) => {
        landingPageHandler?.(url, referer);
        dismiss();
      }}
    />,
    <CgnDiscountDetailHeader discount={discount} />,
    440
  );

  return {
    dismiss,
    present,
    bottomSheet
  };
};
